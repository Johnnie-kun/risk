import { Secret } from 'jsonwebtoken';

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET as Secret || 'your-secret-key',
  expiresIn: '24h',
  refreshExpiresIn: '7d'
};
