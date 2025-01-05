import { Request, Response } from 'express';
import { passwordUtils } from '../utils/password.utils';
import { jwtUtils } from '../utils/jwt.utils';
import { emailService } from '../services/email.service';
import { redisService } from '../services/redis.service';
import { userService } from '../services/user.service'; // Assuming you have a user service

export const authController = {
  /**
   * Handles user registration.
   * Validates input, hashes the password, generates a verification token, and sends a verification email.
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields (email, password, name) are required' });
      }

      // Check if the user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await passwordUtils.hash(password);

      // Generate email verification token
      const verificationToken = jwtUtils.generateAccessToken({ email }, { expiresIn: '24h' });

      // Store token in Redis with expiration
      await redisService.set(`verify_${email}`, verificationToken, 24 * 60 * 60);

      // Send verification email
      await emailService.sendEmail({
        to: email, // Recipient email
        subject: 'Verify Your Email', // Email subject
        html: `
          <h1>Welcome to Bitcoin Predictor</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${process.env.FRONTEND_URL}/verify?token=${verificationToken}">
            Verify Email
          </a>
        ` // Email body
      });

      // Save user in the database
      await userService.create({ email, password: hashedPassword, name });

      return res.status(201).json({ message: 'Registration successful. Please verify your email.' });
    } catch (error) {
      console.error('Registration error:', error.message);
      return res.status(500).json({ error: 'An unexpected error occurred during registration' });
    }
  },

  /**
   * Handles user login.
   * Validates input, checks credentials, and generates access and refresh tokens.
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Fetch user from database
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compare passwords
      const isValidPassword = await passwordUtils.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if the user's email is verified
      if (!user.isVerified) {
        return res.status(403).json({ error: 'Please verify your email before logging in' });
      }

      // Generate access and refresh tokens
      const accessToken = jwtUtils.generateAccessToken({ userId: user.id });
      const refreshToken = jwtUtils.generateRefreshToken({ userId: user.id });

      // Store refresh token in Redis with a 7-day expiration
      await redisService.set(`refresh_${user.id}`, refreshToken, 7 * 24 * 60 * 60);

      return res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({ error: 'An unexpected error occurred during login' });
    }
  },

  /**
   * Handles email verification.
   * Validates the verification token and marks the user as verified in the database.
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Verify the token
      const decoded = jwtUtils.verifyToken(token as string);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Check if the token matches the one stored in Redis
      if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
        const storedToken = await redisService.get(`verify_${decoded.email}`);
        if (!storedToken || storedToken !== token) {
          return res.status(400).json({ error: 'Invalid or expired verification token' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid token structure' });
      }

      // Mark user as verified in the database
      if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
        await userService.verifyEmail(decoded.email);
      } else {
        return res.status(400).json({ error: 'Invalid token structure' });
      }

      // Remove verification token from Redis
      await redisService.delete(`verify_${decoded.email}`);

      return res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error.message);
      return res.status(500).json({ error: 'An unexpected error occurred during email verification' });
    }
  },

  /**
   * Handles token refresh.
   * Validates the refresh token and issues a new access token.
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Verify the refresh token
      const decoded = jwtUtils.verifyToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      // Check if the refresh token matches the one stored in Redis
      if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
        const storedToken = await redisService.get(`refresh_${decoded.userId}`);
        if (!storedToken || storedToken !== refreshToken) {
          return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      // Generate a new access token
      const accessToken = jwtUtils.generateAccessToken({ userId: decoded.userId });

      return res.json({ accessToken });
    } catch (error) {
      console.error('Token refresh error:', error.message);
      return res.status(500).json({ error: 'An unexpected error occurred during token refresh' });
    }
  },
};