import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

export const jwtUtils = {
  generateToken(payload: any) {
    return jwt.sign(payload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn
    });
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_CONFIG.secret);
    } catch (error) {
      return null;
    }
  }
};