import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { CacheService } from './cache.service';
import { BaseService } from './base.service';

export class NotificationService extends BaseService {
  private static instance: NotificationService | null = null;
  private io: SocketServer | null = null;
  private cacheService: CacheService;

  protected constructor() {
    super();
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle room subscriptions
      socket.on('subscribe', (rooms: string[]) => {
        rooms.forEach(room => socket.join(room));
      });

      // Handle room unsubscriptions
      socket.on('unsubscribe', (rooms: string[]) => {
        rooms.forEach(room => socket.leave(room));
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Market Data Notifications
  async broadcastPriceUpdate(symbol: string, price: number) {
    if (!this.io) return;

    const data = {
      symbol,
      price,
      timestamp: Date.now()
    };

    // Cache the price data
    await this.cacheService.cachePrice(symbol, price);

    // Broadcast to relevant room
    this.io.to(`price:${symbol}`).emit('price:update', data);
  }

  async broadcastOrderBookUpdate(symbol: string, orderBook: any) {
    if (!this.io) return;

    const data = {
      symbol,
      ...orderBook,
      timestamp: Date.now()
    };

    // Cache the order book
    await this.cacheService.cacheOrderBook(symbol, orderBook);

    // Broadcast to relevant room
    this.io.to(`orderbook:${symbol}`).emit('orderbook:update', data);
  }

  // Trading Notifications
  async broadcastTradeExecution(trade: any) {
    if (!this.io) return;

    const data = {
      ...trade,
      timestamp: Date.now()
    };

    // Broadcast to general trade room and user-specific room
    this.io.to('trades').emit('trade:new', data);
    this.io.to(`user:${trade.userId}`).emit('trade:executed', data);
  }

  // User Notifications
  async sendUserNotification(userId: number, notification: any) {
    if (!this.io) return;

    const data = {
      ...notification,
      timestamp: Date.now()
    };

    // Broadcast to user-specific room
    this.io.to(`user:${userId}`).emit('notification', data);
  }

  // Chat Notifications
  async broadcastChatMessage(roomId: string, message: any) {
    if (!this.io) return;

    const data = {
      ...message,
      timestamp: Date.now()
    };

    // Broadcast to chat room
    this.io.to(`chat:${roomId}`).emit('chat:message', data);
  }

  // System Notifications
  async broadcastSystemNotification(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.io) return;

    const data = {
      message,
      level,
      timestamp: Date.now()
    };

    // Broadcast to all connected clients
    this.io.emit('system:notification', data);
  }

  // Alert Notifications
  async sendPriceAlert(userId: number, alert: any) {
    if (!this.io) return;

    const data = {
      ...alert,
      timestamp: Date.now()
    };

    // Send to specific user
    this.io.to(`user:${userId}`).emit('price:alert', data);
  }
} 