import { Server } from 'http';
import { NotificationService } from './notification.service';

/**
 * @deprecated Use NotificationService directly instead
 */
export class WebSocketService {
    private static instance: WebSocketService;
    private notificationService: NotificationService;

    private constructor() {
        this.notificationService = NotificationService.getInstance();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    initialize(server: Server) {
        this.notificationService.initialize(server);
    }

    /**
     * @deprecated Use NotificationService.broadcastPriceUpdate instead
     */
    broadcastPriceUpdate(priceData: {
        symbol: string;
        price: number;
        timestamp: number;
    }) {
        this.notificationService.broadcastPriceUpdate(priceData.symbol, priceData.price);
    }

    /**
     * @deprecated Use NotificationService.broadcastOrderBookUpdate instead
     */
    broadcastOrderBookUpdate(orderBookData: {
        symbol: string;
        bids: Array<[number, number]>;
        asks: Array<[number, number]>;
        timestamp: number;
    }) {
        this.notificationService.broadcastOrderBookUpdate(orderBookData.symbol, orderBookData);
    }

    /**
     * @deprecated Use NotificationService.broadcastTradeExecution instead
     */
    broadcastNewTrade(tradeData: {
        price: number;
        amount: number;
        side: 'buy' | 'sell';
        timestamp: number;
    }) {
        this.notificationService.broadcastTradeExecution(tradeData);
    }
}

// Export a deprecated instance for backward compatibility
export const webSocketService = WebSocketService.getInstance();