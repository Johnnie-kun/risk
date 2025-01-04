/**
 * Interface defining the Redis configuration options.
 */
export interface RedisConfig {
    host: string; // Redis server host
    port: number; // Redis server port
    password?: string; // Optional password for authentication
    db?: number; // Optional database index (default: 0)
    tls?: {
      // Optional TLS configuration for secure connections
      ca?: string; // CA certificate
      key?: string; // Private key
      cert?: string; // Public certificate
    };
  }
  
  /**
   * Redis configuration object.
   * Uses environment variables for Redis settings.
   * Throws an error if required variables are missing.
   */
  export const REDIS_CONFIG: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined, // Optional, if password is provided
    db: parseInt(process.env.REDIS_DB || '0', 10), // Default to database 0
    tls: process.env.REDIS_TLS_ENABLED === 'true' ? {
      ca: process.env.REDIS_TLS_CA,
      key: process.env.REDIS_TLS_KEY,
      cert: process.env.REDIS_TLS_CERT,
    } : undefined,
  };
  
  /**
   * Validates the Redis configuration.
   * Throws an error if required fields are missing or invalid.
   */
  const validateRedisConfig = (config: RedisConfig): void => {
    if (!config.host) {
      throw new Error("Missing Redis host in environment variables.");
    }
  
    if (!config.port || isNaN(config.port)) {
      throw new Error("Invalid or missing Redis port in environment variables.");
    }
  
    if (config.db && isNaN(config.db)) {
      throw new Error("Invalid Redis database index in environment variables.");
    }
  
    if (config.tls && (!config.tls.ca || !config.tls.key || !config.tls.cert)) {
      throw new Error("Incomplete TLS configuration for Redis.");
    }
  };
  
  // Validate the Redis configuration at startup
  validateRedisConfig(REDIS_CONFIG);