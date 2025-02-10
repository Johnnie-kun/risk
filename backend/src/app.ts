import express, { RequestHandler, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg'; // PostgreSQL client
import { redisService } from './services/redis.service';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test PostgreSQL connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err.stack));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health Check
const healthCheck: RequestHandler = async (_req, res) => {
  try {
    const redisStatus = await redisService.ping() === 'PONG' ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', redis: redisStatus });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
};

// Routes
app.get('/health', healthCheck);
app.use('/api/auth', authRoutes);

// Sample route to fetch data from PostgreSQL
app.get("/data", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM your_table_name LIMIT 10"); // Replace with your table name
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    // Connect to Redis first
    await connectToRedis();
    console.log(`Connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    
    // Then start the server
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Redis Connection
const connectToRedis = async (retries = 5, delay = 5000): Promise<void> => {
  try {
    await redisService.connect();
    console.log(`Connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  } catch (error) {
    console.error('Redis connection error:', error);
    if (retries > 0) {
      console.log(`Retrying connection in ${delay}ms... (${retries} attempts remaining)`);
      setTimeout(() => connectToRedis(retries - 1, delay), delay);
    } else {
      console.error('Max retries reached. Failed to connect to Redis.');
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server and Redis connection');
  await redisService.disconnect();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
  next(err);
});

export default app;
