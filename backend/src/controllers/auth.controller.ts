import { Request, Response } from 'express';
import { passwordUtils } from '../utils/password.utils';
import { emailService } from '../services/email.service';
import { userService } from '../services/user.service';
import { TokenService } from '../services/token.service';

export const authController = {
  /**
   * Handles user registration.
   * Validates input, hashes the password, generates a verification token, and sends a verification email.
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const tokenService = TokenService.getInstance();

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
      const verificationToken = await tokenService.generateEmailVerificationToken(email);

      // Send verification email
      await emailService.sendEmail({
        to: email,
        subject: 'Verify Your Email',
        html: `
          <h1>Welcome to Bitcoin Predictor</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${process.env.FRONTEND_URL}/verify?token=${verificationToken}">
            Verify Email
          </a>
        `
      });

      // Save user in the database
      await userService.create({ email, password: hashedPassword, name });

      return res.status(201).json({ message: 'Registration successful. Please verify your email.' });
    } catch (error) {
      console.error('Registration error:', (error as Error).message);
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
      const tokenService = TokenService.getInstance();

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
      const accessToken = await tokenService.generateAccessToken({ userId: user.id });
      const refreshToken = await tokenService.generateRefreshToken({ userId: user.id });

      return res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Login error:', (error as Error).message);
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
      const tokenService = TokenService.getInstance();

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Verify the token
      const decoded = await tokenService.verifyToken(token);
      if (!decoded || typeof decoded !== 'object' || !('email' in decoded)) {
        return res.status(400).json({ error: 'Invalid token structure' });
      }

      // Verify email token
      const isValid = await tokenService.verifyEmailToken(token, decoded.email);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Mark user as verified in the database
      await userService.verifyEmail(decoded.email);

      return res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', (error as Error).message);
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
      const tokenService = TokenService.getInstance();

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Verify the refresh token
      const decoded = await tokenService.verifyToken(refreshToken);
      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        return res.status(401).json({ error: 'Invalid token structure' });
      }

      // Verify refresh token in Redis
      const isValid = await tokenService.verifyRefreshToken(refreshToken, decoded.userId);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      // Generate a new access token
      const accessToken = await tokenService.generateAccessToken({ userId: decoded.userId });

      return res.json({ accessToken });
    } catch (error) {
      console.error('Token refresh error:', (error as Error).message);
      return res.status(500).json({ error: 'An unexpected error occurred during token refresh' });
    }
  },
};