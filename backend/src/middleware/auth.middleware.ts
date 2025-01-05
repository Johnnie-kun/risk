import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt.utils';

/**
 * Extended Request interface to include user information.
 */
export interface AuthRequest extends Request {
  user?: Record<string, any>; // Replace with your User type if available
}

/**
 * Middleware to authenticate requests using JWT.
 * Verifies the token and attaches the decoded user information to the request.
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is missing' });
      return;
    }

    // Check if the header is in the correct format (Bearer <token>)
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid authorization format' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Token is missing' });
      return;
    }

    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach decoded user information to the request
    req.user = decoded as Record<string, any>;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};