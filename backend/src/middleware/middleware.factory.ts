import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export interface MiddlewareOptions {
  errorHandler?: (error: Error) => any;
  successHandler?: (result: any) => any;
}

export class MiddlewareFactory {
  static createValidationMiddleware(schema: Schema, options: MiddlewareOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = await schema.validateAsync(req.body);
        req.body = validated;
        next();
        return;
      } catch (err) {
        const error = err as Error;
        if (options.errorHandler) {
          return res.status(400).json(options.errorHandler(error));
        }
        return res.status(400).json({ error: error.message });
      }
    };
  }

  static createAsyncMiddleware(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
    options: MiddlewareOptions = {}
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await handler(req, res, next);
        if (options.successHandler) {
          return res.json(options.successHandler(result));
        }
        return res.json(result);
      } catch (err) {
        const error = err as Error;
        if (options.errorHandler) {
          return res.status(500).json(options.errorHandler(error));
        }
        next(error);
        return;
      }
    };
  }

  static createRateLimitMiddleware(
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    maxRequests: number = 100
  ) {
    const requests = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();
      const ip = req.ip || req.socket.remoteAddress || 'unknown';

      // Get existing requests for this IP
      let userRequests = requests.get(ip) || [];
      
      // Remove requests outside the window
      userRequests = userRequests.filter(time => time > now - windowMs);
      
      if (userRequests.length >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.'
        });
      }

      // Add current request
      userRequests.push(now);
      requests.set(ip, userRequests);

      next();
      return;
    };
  }

  static createErrorHandlerMiddleware() {
    return (error: Error, _: Request, res: Response) => {
      console.error('Global error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.message
        });
      }

      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
          error: 'Unauthorized',
          details: error.message
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred'
          : error.message
      });
    };
  }
} 