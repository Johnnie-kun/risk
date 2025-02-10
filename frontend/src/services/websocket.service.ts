import { io, Socket } from 'socket.io-client';

interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: number;
}

interface OrderBookUpdate {
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
    timestamp: number;
}

interface TradeUpdate {
    price: number;
    amount: number;
    side: 'buy' | 'sell';
    timestamp: number;
}

class WebSocketService {
    private socket: Socket | null = null;
    private priceUpdateCallbacks: ((data: PriceUpdate) => void)[] = [];
    private orderBookUpdateCallbacks: ((data: OrderBookUpdate) => void)[] = [];
    private tradeUpdateCallbacks: ((data: TradeUpdate) => void)[] = [];

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001', {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('price:update', (data: PriceUpdate) => {
            this.priceUpdateCallbacks.forEach(callback => callback(data));
        });

        this.socket.on('orderbook:update', (data: OrderBookUpdate) => {
            this.orderBookUpdateCallbacks.forEach(callback => callback(data));
        });

        this.socket.on('trade:new', (data: TradeUpdate) => {
            this.tradeUpdateCallbacks.forEach(callback => callback(data));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribeToPriceUpdates(callback: (data: PriceUpdate) => void) {
        if (this.socket) {
            this.socket.emit('subscribe:price');
            this.priceUpdateCallbacks.push(callback);
        }
    }

    subscribeToOrderBookUpdates(callback: (data: OrderBookUpdate) => void) {
        if (this.socket) {
            this.socket.emit('subscribe:orderbook');
            this.orderBookUpdateCallbacks.push(callback);
        }
    }

    subscribeToTradeUpdates(callback: (data: TradeUpdate) => void) {
        if (this.socket) {
            this.socket.emit('subscribe:trades');
            this.tradeUpdateCallbacks.push(callback);
        }
    }

    unsubscribeFromPriceUpdates(callback: (data: PriceUpdate) => void) {
        this.priceUpdateCallbacks = this.priceUpdateCallbacks.filter(cb => cb !== callback);
    }

    unsubscribeFromOrderBookUpdates(callback: (data: OrderBookUpdate) => void) {
        this.orderBookUpdateCallbacks = this.orderBookUpdateCallbacks.filter(cb => cb !== callback);
    }

    unsubscribeFromTradeUpdates(callback: (data: TradeUpdate) => void) {
        this.tradeUpdateCallbacks = this.tradeUpdateCallbacks.filter(cb => cb !== callback);
    }
}

export const webSocketService = new WebSocketService();