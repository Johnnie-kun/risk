import { HistoricalData } from './tradingService'
import { Subject } from 'rxjs'
import { debounceTime, bufferTime } from 'rxjs/operators'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WebSocketMessage {
  type: 'price' | 'orderbook' | 'trade' | 'chart'
  data: any
}

class WebSocketService {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000 // Start with 1 second delay
    private heartbeatInterval: NodeJS.Timeout | null = null
    private messageSubject = new Subject<WebSocketMessage>()
    private statusSubject = new Subject<WebSocketStatus>()
    private priceSubscribers: ((data: { price: number }) => void)[] = []
    private orderBookSubscribers: ((data: { bids: [number, number][], asks: [number, number][] }) => void)[] = []
    private tradeSubscribers: ((data: { price: number, amount: number, side: 'buy' | 'sell', timestamp: number }) => void)[] = []
    private chartSubscribers: ((data: HistoricalData) => void)[] = []

    constructor() {
        // Buffer messages and emit them in batches
        this.messageSubject.pipe(
            bufferTime(100), // Buffer messages for 100ms
            debounceTime(50) // Wait 50ms after last message before emitting
        ).subscribe(messages => {
            messages.forEach(msg => this.handleMessage(msg))
        })

        // Initialize connection status updates
        this.statusSubject.subscribe(status => {
            console.log(`WebSocket Status: ${status}`)
            // You can add additional status handling here
        })
    }

    connect() {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.statusSubject.next('connecting')
            
            try {
                this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws')
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected')
                    this.statusSubject.next('connected')
                    this.reconnectAttempts = 0
                    this.reconnectDelay = 1000
                    this.startHeartbeat()
                }
                
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data)
                        this.messageSubject.next(message)
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error)
                    }
                }
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    this.statusSubject.next('error')
                    this.cleanup()
                }
                
                this.ws.onclose = () => {
                    console.log('WebSocket closed')
                    this.statusSubject.next('disconnected')
                    this.cleanup()
                    this.handleReconnect()
                }
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error)
                this.statusSubject.next('error')
                this.handleReconnect()
            }
        }
    }

    private handleMessage(message: WebSocketMessage) {
        switch (message.type) {
            case 'price':
                this.priceSubscribers.forEach(callback => callback(message.data))
                break
            case 'orderbook':
                this.orderBookSubscribers.forEach(callback => callback(message.data))
                break
            case 'trade':
                this.tradeSubscribers.forEach(callback => callback(message.data))
                break
            case 'chart':
                this.chartSubscribers.forEach(callback => callback(message.data))
                break
            default:
                console.warn('Unknown message type:', message.type)
        }
    }

    private startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }

        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }))
            }
        }, 30000) // Send heartbeat every 30 seconds
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            
            // Exponential backoff
            setTimeout(() => {
                this.connect()
            }, this.reconnectDelay)
            
            // Increase delay for next attempt (max 30 seconds)
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
        } else {
            console.error('Max reconnection attempts reached')
            this.statusSubject.next('error')
        }
    }

    private cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close()
            this.cleanup()
            this.ws = null
            this.statusSubject.next('disconnected')
        }
    }

    getStatus() {
        return this.statusSubject.asObservable()
    }

    // Price updates
    subscribeToPriceUpdates(callback: (data: { price: number }) => void) {
        this.priceSubscribers.push(callback)
        return () => this.unsubscribeFromPriceUpdates(callback)
    }

    unsubscribeFromPriceUpdates(callback: (data: { price: number }) => void) {
        this.priceSubscribers = this.priceSubscribers.filter(cb => cb !== callback)
    }

    // Order book updates
    subscribeToOrderBookUpdates(callback: (data: { bids: [number, number][], asks: [number, number][] }) => void) {
        this.orderBookSubscribers.push(callback)
        return () => this.unsubscribeFromOrderBookUpdates(callback)
    }

    unsubscribeFromOrderBookUpdates(callback: (data: { bids: [number, number][], asks: [number, number][] }) => void) {
        this.orderBookSubscribers = this.orderBookSubscribers.filter(cb => cb !== callback)
    }

    // Trade updates
    subscribeToTradeUpdates(callback: (data: { price: number, amount: number, side: 'buy' | 'sell', timestamp: number }) => void) {
        this.tradeSubscribers.push(callback)
        return () => this.unsubscribeFromTradeUpdates(callback)
    }

    unsubscribeFromTradeUpdates(callback: (data: { price: number, amount: number, side: 'buy' | 'sell', timestamp: number }) => void) {
        this.tradeSubscribers = this.tradeSubscribers.filter(cb => cb !== callback)
    }

    // Chart updates
    subscribeToChartData(callback: (data: HistoricalData) => void) {
        this.chartSubscribers.push(callback)
        return () => this.unsubscribeFromChartData(callback)
    }

    unsubscribeFromChartData(callback: (data: HistoricalData) => void) {
        this.chartSubscribers = this.chartSubscribers.filter(cb => cb !== callback)
    }
}

export const webSocketService = new WebSocketService()
