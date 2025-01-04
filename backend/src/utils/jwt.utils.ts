import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config";

export const jwtUtils = {
  /**
   * Generate an access token with the given payload.
   * @param payload - The data to encode in the token.
   * @param options - Additional options for token generation.
   * @returns A signed JWT.
   * @throws {Error} If token generation fails.
   */
  generateAccessToken(payload: Record<string, unknown>, options?: SignOptions): string {
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
  },

  /**
   * Generate a refresh token with the given payload.
   * @param payload - The data to encode in the refresh token.
   * @param options - Additional options for token generation.
   * @returns A signed refresh JWT.
   * @throws {Error} If token generation fails.
   */
  generateRefreshToken(payload: Record<string, unknown>, options?: SignOptions): string {
    try {
      return jwt.sign(payload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.refreshTokenExpiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        ...options,
      });
    } catch (error) {
      console.error("Failed to generate refresh token:", error);
      throw new Error("Failed to generate refresh token.");
    }
  },

  /**
   * Verify the validity of a token.
   * @param token - The JWT to verify.
   * @param options - Additional options for token verification.
   * @returns The decoded payload if valid.
   * @throws {Error} If the token is invalid or verification fails.
   */
  verifyToken(token: string, options?: VerifyOptions): JwtPayload | string {
    try {
      return jwt.verify(token, JWT_CONFIG.secret as Secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        ...options,
      });
    } catch (error) {
      console.error("Failed to verify token:", error);
      throw new Error("Invalid or expired token.");
    }
  },

  /**
   * Decode a token without verifying its signature.
   * @param token - The JWT to decode.
   * @returns The decoded payload or null if decoding fails.
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token, { json: true }) as JwtPayload;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  },
};