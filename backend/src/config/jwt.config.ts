import { Secret } from "jsonwebtoken";

// Validate environment variables at startup
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET as Secret, // Ensure JWT_SECRET is set
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "24h", // Default: 24 hours
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d", // Default: 7 days
  issuer: process.env.JWT_ISSUER || "bitcoin-predictor-app", // Optional: Token issuer
  audience: process.env.JWT_AUDIENCE || "bitcoin-predictor-app", // Optional: Token audience
};