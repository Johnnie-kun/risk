import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { redisService } from './services/redis.service';
import { webSocketService } from './services/websocket.service';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle PostgreSQL errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
  process.exit(1);
});

// Test PostgreSQL connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err.stack));

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ALLOWED_ORIGINS || '*' }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Configurable)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health Check
app.get('/health', async (_req, res) => {
  try {
    const redisStatus = (await redisService.ping()) === 'PONG' ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', redis: redisStatus });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Sample PostgreSQL Route
app.get("/data", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM actual_table_name LIMIT 10"); // Replace with your table
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching data:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Redis Connection (Handles Retries)
const connectToRedis = async (retries = 5, delay = 5000): Promise<void> => {
  try {
    await redisService.connect();
    console.log(`✅ Connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    if (retries > 0) {
      console.log(`🔁 Retrying in ${delay}ms... (${retries} retries left)`);
      setTimeout(() => connectToRedis(retries - 1, delay), delay);
    } else {
      console.error('🚨 Max retries reached. Could not connect to Redis.');
      console.warn('⚠️ Application will continue without Redis. Some features may not work properly.');
      // Don't exit the process, let the application continue without Redis
    }
  }
};

// Start Server
let httpServer: ReturnType<typeof createServer>;

const startServer = async () => {
  try {
    // Try to connect to Redis but don't fail if it doesn't connect
    try {
      await connectToRedis();
    } catch (error) {
      console.warn('⚠️ Redis connection failed, but server will continue without it.');
    }
    
    webSocketService.initialize(server);

    httpServer = server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
const shutdownHandler = async () => {
  console.log('⚠️ Graceful shutdown initiated...');
  
  try {
    console.log('🛑 Closing Redis connection...');
    await redisService.disconnect();
    
    console.log('🛑 Closing PostgreSQL connection pool...');
    await pool.end();

    console.log('🛑 Closing HTTP server...');
    httpServer.close(() => {
      console.log('✅ Server closed. Exiting process.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Listen for SIGTERM & SIGINT for clean shutdown
process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);

// Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
  next(err);
});

export default app;
