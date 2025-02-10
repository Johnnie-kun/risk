import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { redisService } from './redis.service';

class WebSocketService {
    private io: SocketServer | null = null;

    initialize(server: Server) {
        this.io = new SocketServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });

        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Handle subscription to price updates
            socket.on('subscribe:price', () => {
                socket.join('price-updates');
            });

            // Handle subscription to order book updates
            socket.on('subscribe:orderbook', () => {
                socket.join('orderbook-updates');
            });

            // Handle subscription to trade history
            socket.on('subscribe:trades', () => {
                socket.join('trade-updates');
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    // Broadcast price update to all subscribed clients
    broadcastPriceUpdate(priceData: {
        symbol: string;
        price: number;
        timestamp: number;
    }) {
        if (!this.io) return;
        this.io.to('price-updates').emit('price:update', priceData);
    }

    // Broadcast order book update
    broadcastOrderBookUpdate(orderBookData: {
        bids: Array<[number, number]>;
        asks: Array<[number, number]>;
        timestamp: number;
    }) {
        if (!this.io) return;
        this.io.to('orderbook-updates').emit('orderbook:update', orderBookData);
    }

    // Broadcast new trade
    broadcastNewTrade(tradeData: {
        price: number;
        amount: number;
        side: 'buy' | 'sell';
        timestamp: number;
    }) {
        if (!this.io) return;
        this.io.to('trade-updates').emit('trade:new', tradeData);
    }

    // Cache the latest price in Redis
    async cacheLatestPrice(symbol: string, price: number) {
        try {
            await redisService.set(`price:${symbol}`, price.toString());
        } catch (error) {
            console.error('Error caching price:', error);
        }
    }
}

export const webSocketService = new WebSocketService();