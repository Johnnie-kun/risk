import express, { Router, RequestHandler } from 'express';
import dotenv from 'dotenv';
import { redisService } from './services/redis.service';

// Load environment variables
dotenv.config();

// Add these lines to log the Redis host and port
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const router = Router();

// Connect to Redis with retry logic
const connectToRedis = async (retries = 5, delay = 5000): Promise<void> => {
  try {
    await redisService.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
    if (retries > 0) {
      console.log(`Retrying Redis connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectToRedis(retries - 1, delay), delay);
    } else {
      console.error('Failed to connect to Redis after multiple attempts.');
      process.exit(1); // Exit the process if Redis connection fails after retries
    }
  }
};

// Call Redis connection
connectToRedis();

// Health check route
const healthCheck: RequestHandler = async (_req, res) => {
  try {
    await redisService.get('health-check');
    res.status(200).json({ status: 'ok', redis: 'connected' });
  } catch (error) {
    res.status(200).json({ status: 'ok', redis: 'disconnected' });
  }
};

// Example route: Set a key in Redis
const setKey: RequestHandler = async (req, res) => {
  const { key, value, expireInSeconds } = req.body;

  if (!key || !value) {
    res.status(400).json({ error: 'Key and value are required.' });
    return;
  }

  try {
    await redisService.set(key, value, expireInSeconds);
    res.status(200).json({ message: 'Key set successfully' });
  } catch (error) {
    console.error('Error setting key in Redis:', error);
    res.status(500).json({ error: 'Failed to set key in Redis' });
  }
};

// Example route: Get a key from Redis
const getKey: RequestHandler = async (req, res) => {
  const { key } = req.params;

  if (!key) {
    res.status(400).json({ error: 'Key is required.' });
    return;
  }

  try {
    const value = await redisService.get(key);
    if (value === null) {
      res.status(404).json({ error: 'Key not found' });
      return;
    }
    res.status(200).json({ key, value });
  } catch (error) {
    console.error('Error getting key from Redis:', error);
    res.status(500).json({ error: 'Failed to get key from Redis' });
  }
};

router.get('/health', healthCheck);
router.post('/set', setKey);
router.get('/get/:key', getKey);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use(router);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown (SIGINT, SIGTERM)
const shutdown = async () => {
  console.log('Shutting down server...');
  await redisService.disconnect(); // Close Redis connection
  server.close(() => {
    console.log('Server closed');
    process.exit(0); // Exit process
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);