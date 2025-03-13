import { createClient, RedisClientType } from 'redis';
import { REDIS_CONFIG } from '../config/redis.config';

// Create a Redis client
const redisClient: RedisClientType = createClient({
  url: `redis://${REDIS_CONFIG.password ? `:${REDIS_CONFIG.password}@` : ''}${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
  database: REDIS_CONFIG.db,
  socket: {
    reconnectStrategy: (retries) => {
      // Maximum retry delay is 10 seconds
      const delay = Math.min(retries * 1000, 10000);
      console.log(`Redis reconnect attempt ${retries} in ${delay}ms`);
      return delay;
    }
  }
});

// Event listeners for Redis client
redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('ready', () => console.log('Redis client is ready'));
redisClient.on('end', () => console.log('Redis connection closed'));
redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));

export const redisService = {
  /**
   * Connects to the Redis server.
   * @throws {Error} If the connection fails.
   */
  async connect(): Promise<void> {
    try {
      await redisClient.connect();
      console.log('Redis connection established');
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      throw new Error('Failed to connect to Redis');
    }
  },

  /**
   * Sets a value in Redis with an optional expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to store.
   * @param {number} [expireInSeconds] - Optional expiration time in seconds.
   * @throws {Error} If the operation fails.
   */
  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client is not connected. Skipping set operation.');
        return;
      }
      
      if (expireInSeconds) {
        // Use SET with EX option for atomic set-and-expire operation
        await redisClient.set(key, value, { EX: expireInSeconds });
      } else {
        await redisClient.set(key, value);
      }
      console.log(`Key "${key}" set successfully`);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
      // Don't throw, just log the error
    }
  },

  /**
   * Gets a value from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string | null>} The value associated with the key, or `null` if the key does not exist.
   * @throws {Error} If the operation fails.
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client is not connected. Returning null for get operation.');
        return null;
      }
      
      const value = await redisClient.get(key);
      console.log(`Key "${key}" retrieved successfully`);
      return value;
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      return null;
    }
  },

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @throws {Error} If the operation fails.
   */
  async delete(key: string): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client is not connected. Skipping delete operation.');
        return;
      }
      
      await redisClient.del(key);
      console.log(`Key "${key}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
      // Don't throw, just log the error
    }
  },

  /**
   * Closes the Redis client connection.
   */
  async disconnect(): Promise<void> {
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
        console.log('Redis connection closed');
      }
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  },

  /**
   * Pings the Redis server.
   * @returns {Promise<string>} The response from the Redis server.
   * @throws {Error} If the operation fails.
   */
  async ping(): Promise<string> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client is not connected. Cannot ping.');
        return 'DISCONNECTED';
      }
      
      const response = await redisClient.ping();
      console.log('Redis server pinged successfully');
      return response;
    } catch (error) {
      console.error('Error pinging Redis server:', error);
      return 'ERROR';
    }
  },

  client: redisClient,
};