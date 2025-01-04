import express, { Router, RequestHandler } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { redisService } from './services/redis.service';
import authRoutes from './routes/auth.routes';
import { createRateLimiter } from './middleware/rate-limit.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(helmet());

// Redis Connection
const connectToRedis = async (retries = 5, delay = 5000): Promise<void> => {
  try {
    await redisService.connect();
    console.log(`Connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  } catch (error) {
    console.error('Redis connection error:', error);
    if (retries > 0) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      setTimeout(() => connectToRedis(retries - 1, delay), delay);
    } else {
      console.error('Failed to connect to Redis.');
      process.exit(1);
    }
  }
};
connectToRedis();

// Health Check
const healthCheck: RequestHandler = async (_req, res) => {
  try {
    const redisStatus = (await redisService.ping()) ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', redis: redisStatus });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
};

// Global Rate Limiter
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});
app.use(globalLimiter);

// Routes
const router = Router();

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', healthCheck);

/**
 * @route POST /set
 * @desc Set a key-value pair in Redis
 * @access Public
 */
router.post('/set', async (req, res) => {
  const { key, value, expireInSeconds } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value are required' });
  }
  try {
    await redisService.set(key, value, expireInSeconds);
    res.status(200).json({ message: 'Key set successfully' });
  } catch (error) {
    console.error('Error setting key in Redis:', error);
    res.status(500).json({ error: 'Failed to set key in Redis' });
  }
});

/**
 * @route GET /get/:key
 * @desc Get a value from Redis by key
 * @access Public
 */
router.get('/get/:key', async (req, res) => {
  const { key } = req.params;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  try {
    const value = await redisService.get(key);
    if (!value) {
      return res.status(404).json({ error: 'Key not found' });
    }
    res.status(200).json({ key, value });
  } catch (error) {
    console.error('Error getting key from Redis:', error);
    res.status(500).json({ error: 'Failed to get key from Redis' });
  }
});

// Mount routes
app.use('/api', router);
app.use('/api/auth', authRoutes);

// Error Handling
app.use((err: Error, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  try {
    if (redisService.isConnected()) {
      await redisService.disconnect();
      console.log('Redis connection closed');
    }
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);