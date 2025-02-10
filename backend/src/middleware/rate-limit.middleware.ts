import rateLimit from 'express-rate-limit';
import { redisService } from '../services/redis.service';
import { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request } from 'express';

// Extend the Request interface to include rateLimit
interface RateLimitRequest extends Request {
  rateLimit?: {
    resetTime?: number; // Add resetTime property
  };
}

/**
 * Creates a rate limiter middleware using Redis as the store.
 *
 * @param options - Configuration options for rate limiting.
 * @returns A rate-limiting middleware for Express.
 */
export const createRateLimiter = (options?: {
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  max?: number; // Maximum number of requests per windowMs (default: 100)
  message?: string; // Error message for rate-limited requests (default: 'Too many requests, please try again later')
  prefix?: string; // Redis key prefix (default: 'rate-limit:')
}): RateLimitRequestHandler => {
  const {
    windowMs = 15 * 60 * 1000, // Default: 15 minutes
    max = 100, // Default: 100 requests per window
    message = 'Too many requests, please try again later',
    prefix = 'rate-limit:', // Default Redis key prefix
  } = options || {};

  // Ensure Redis client is connected
  if (!redisService.client.isOpen) {
    console.error('Redis client is not connected. Rate limiting may not work as expected.');
  }

  return rateLimit({
    store: new RedisStore({
      sendCommand: async (...args: string[]) => {
        try {
          return await redisService.client.sendCommand(args);
        } catch (error) {
          console.error('Redis command error in rate limiter:', error);
          throw error;
        }
      },
      prefix, // Custom Redis key prefix
    }),
    windowMs,
    max,
    message,
    standardHeaders: true, // Include `RateLimit-*` headers in the response
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req: RateLimitRequest, res) => {
      // Custom handler for rate-limited requests
      res.status(429).json({
        error: message,
        retryAfter: req.rateLimit?.resetTime
          ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
          : undefined,
      });
    },
  });
};