import { JwtPayload, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config";
import { redisService } from "./redis.service";
import jwt from "jsonwebtoken";

export class TokenService {
  private static instance: TokenService;

  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Generate an access token
   */
  async generateAccessToken(payload: Record<string, unknown>, options?: SignOptions): Promise<string> {
    try {
      return jwt.sign(payload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.accessTokenExpiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        ...options,
      });
    } catch (error) {
      console.error("Failed to generate access token:", error);
      throw new Error("Failed to generate access token.");
    }
  }

  /**
   * Generate a refresh token
   */
  async generateRefreshToken(payload: Record<string, unknown>, options?: SignOptions): Promise<string> {
    try {
      const token = jwt.sign(payload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.refreshTokenExpiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        ...options,
      });

      // Store refresh token in Redis
      const userId = (payload as { userId: number }).userId;
      await redisService.set(`refresh_${userId}`, token, 7 * 24 * 60 * 60); // 7 days

      return token;
    } catch (error) {
      console.error("Failed to generate refresh token:", error);
      throw new Error("Failed to generate refresh token.");
    }
  }

  /**
   * Verify a token
   */
  async verifyToken(token: string, options?: VerifyOptions): Promise<JwtPayload> {
    try {
      return jwt.verify(token, JWT_CONFIG.secret as Secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        ...options,
      }) as JwtPayload;
    } catch (error) {
      console.error("Failed to verify token:", error);
      throw new Error("Invalid or expired token.");
    }
  }

  /**
   * Verify refresh token including Redis check
   */
  async verifyRefreshToken(token: string, userId: number): Promise<boolean> {
    try {
      const decoded = await this.verifyToken(token);
      const storedToken = await redisService.get(`refresh_${userId}`);
      return storedToken === token && decoded.userId === userId;
    } catch {
      return false;
    }
  }

  /**
   * Invalidate a refresh token
   */
  async invalidateRefreshToken(userId: number): Promise<void> {
    await redisService.delete(`refresh_${userId}`);
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(email: string): Promise<string> {
    const token = await this.generateAccessToken({ email }, { expiresIn: '24h' });
    await redisService.set(`verify_${email}`, token, 24 * 60 * 60);
    return token;
  }

  /**
   * Verify email verification token
   */
  async verifyEmailToken(token: string, email: string): Promise<boolean> {
    try {
      const decoded = await this.verifyToken(token);
      const storedToken = await redisService.get(`verify_${email}`);
      return storedToken === token && decoded.email === email;
    } catch {
      return false;
    }
  }
} 