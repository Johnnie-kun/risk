import { redisService } from './redis.service';
import { BaseService } from './base.service';

export class CacheService extends BaseService {
  protected constructor() {
    super();
  }

  /**
   * Cache market price data
   */
  async cachePrice(symbol: string, price: number, ttl: number = 300): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.set(`price:${symbol}`, price.toString(), ttl);
      },
      'cachePrice'
    );
  }

  /**
   * Get cached price
   */
  async getPrice(symbol: string): Promise<number | null> {
    return this.tryCatch(
      async () => {
        const price = await redisService.get(`price:${symbol}`);
        return price ? parseFloat(price) : null;
      },
      'getPrice',
      null
    );
  }

  /**
   * Cache order book data
   */
  async cacheOrderBook(symbol: string, orderBook: any, ttl: number = 60): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.set(`orderbook:${symbol}`, JSON.stringify(orderBook), ttl);
      },
      'cacheOrderBook'
    );
  }

  /**
   * Get cached order book
   */
  async getOrderBook(symbol: string): Promise<any | null> {
    return this.tryCatch(
      async () => {
        const orderBook = await redisService.get(`orderbook:${symbol}`);
        return orderBook ? JSON.parse(orderBook) : null;
      },
      'getOrderBook',
      null
    );
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(userId: number, sessionData: any, ttl: number = 3600): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.set(`session:${userId}`, JSON.stringify(sessionData), ttl);
      },
      'cacheUserSession'
    );
  }

  /**
   * Get cached user session
   */
  async getUserSession(userId: number): Promise<any | null> {
    return this.tryCatch(
      async () => {
        const session = await redisService.get(`session:${userId}`);
        return session ? JSON.parse(session) : null;
      },
      'getUserSession',
      null
    );
  }

  /**
   * Cache FAQ data
   */
  async cacheFAQ(faqData: any): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.set('faq:data', JSON.stringify(faqData));
      },
      'cacheFAQ'
    );
  }

  /**
   * Get cached FAQ data
   */
  async getFAQ(): Promise<any | null> {
    return this.tryCatch(
      async () => {
        const faq = await redisService.get('faq:data');
        return faq ? JSON.parse(faq) : null;
      },
      'getFAQ',
      null
    );
  }

  /**
   * Cache trading pair data
   */
  async cacheTradingPair(pair: string, data: any, ttl: number = 300): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.set(`trading:${pair}`, JSON.stringify(data), ttl);
      },
      'cacheTradingPair'
    );
  }

  /**
   * Get cached trading pair data
   */
  async getTradingPair(pair: string): Promise<any | null> {
    return this.tryCatch(
      async () => {
        const data = await redisService.get(`trading:${pair}`);
        return data ? JSON.parse(data) : null;
      },
      'getTradingPair',
      null
    );
  }

  /**
   * Clear cache by pattern
   */
  async clearCacheByPattern(pattern: string): Promise<void> {
    return this.tryCatch(
      async () => {
        // Note: This is a simplified version. In production, you'd want to use SCAN
        const keys = await redisService.client.keys(pattern);
        for (const key of keys) {
          await redisService.delete(key);
        }
      },
      'clearCacheByPattern'
    );
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    return this.tryCatch(
      async () => {
        await redisService.client.flushDb();
      },
      'clearAllCache'
    );
  }
} 