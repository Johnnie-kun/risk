import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { validate } from '../middleware/validate.middleware'; // Optional: Add validation middleware
import { registerSchema, loginSchema } from '../schemas/auth.schema'; // Optional: Add validation schemas

const router = Router();

// Rate limiters
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later',
});

// Routes

/**
 * @route POST /register
 * @desc User registration with email verification
 * @access Public
 */
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema), // Optional: Add validation middleware
  authController.register
);

/**
 * @route POST /login
 * @desc User login with token generation
 * @access Public
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema), // Optional: Add validation middleware
  authController.login
);

/**
 * @route GET /verify-email
 * @desc Verify email address using token
 * @access Public
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @route POST /refresh-token
 * @desc Refresh access token using a valid refresh token
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);

export default router;