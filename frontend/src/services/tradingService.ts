import { httpClient } from '../utils/httpClient'
import { AxiosResponse } from 'axios'
import { api } from './api'
import { BinanceTicker, BinanceOrder } from '../types'

export interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price?: number
  amount: number
  status: 'open' | 'filled' | 'cancelled'
  timestamp: Date
}

export interface Position {
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  amount: number
  unrealizedPnl: number
  liquidationPrice: number
}

export interface OrderBook {
  bids: [number, number][] // [price, size][]
  asks: [number, number][] // [price, size][]
}

export interface HistoricalData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface OrderRequest {
  type: 'buy' | 'sell'
  amount: number
  price?: number
  orderType: 'market' | 'limit'
}

interface OrderResponse {
  id: string
  status: 'pending' | 'filled' | 'cancelled'
  // Add other order response fields as needed
}

interface CandlestickData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface TradeData {
  price: number
  amount: number
  side: 'buy' | 'sell'
  timestamp: string
}

class TradingService {
  private readonly baseUrl = '/api/trading'
  private static instance: TradingService

  private constructor() {}

  public static getInstance(): TradingService {
    if (!TradingService.instance) {
      TradingService.instance = new TradingService()
    }
    return TradingService.instance
  }

  // Order Management
  async placeOrder(order: Omit<Order, 'id' | 'status' | 'timestamp'>): Promise<Order> {
    const response: AxiosResponse<Order> = await httpClient.post('/api/trading/orders', order)
    return response.data
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const response: AxiosResponse<{ success: boolean }> = await httpClient.delete(`/api/trading/orders/${orderId}`)
    return response.data.success
  }

  async getOrders(): Promise<Order[]> {
    const response: AxiosResponse<Order[]> = await httpClient.get('/api/trading/orders')
    return response.data
  }

  // Position Management
  async getPositions(): Promise<Position[]> {
    const response: AxiosResponse<Position[]> = await httpClient.get('/api/trading/positions')
    return response.data
  }

  async closePosition(symbol: string): Promise<boolean> {
    const response: AxiosResponse<{ success: boolean }> = await httpClient.post(
      `/api/trading/positions/${symbol}/close`
    )
    return response.data.success
  }

  // Historical Data
  async getHistoricalData(
    symbol: string,
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d',
    limit: number = 1000,
    endTime?: Date
  ): Promise<HistoricalData[]> {
    const params = new URLSearchParams({
      symbol,
      timeframe,
      limit: limit.toString(),
      ...(endTime && { endTime: endTime.toISOString() })
    })

    const response: AxiosResponse<HistoricalData[]> = await httpClient.get(`/api/trading/historical?${params}`)
    return response.data
  }

  // Order Book
  async getOrderBook(symbol: string, depth: number = 100): Promise<OrderBook> {
    const response: AxiosResponse<OrderBook> = await httpClient.get(`/api/trading/orderbook/${symbol}?depth=${depth}`)
    return response.data
  }

  async getCandlestickData(
    symbol: string = 'BTC/USD',
    timeframe: string = '1d',
    limit: number = 100
  ): Promise<CandlestickData[]> {
    const response: AxiosResponse<CandlestickData[]> = await httpClient.get(
      `${this.baseUrl}/candlesticks?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
    )
    return response.data
  }

  async getRecentTrades(
    symbol: string = 'BTC/USD',
    limit: number = 50
  ): Promise<TradeData[]> {
    const response: AxiosResponse<TradeData[]> = await httpClient.get(
      `${this.baseUrl}/trades?symbol=${symbol}&limit=${limit}`
    )
    return response.data
  }

  async getCurrentPrice(symbol: string): Promise<BinanceTicker> {
    try {
      const response = await api.get(`/trading/price/${symbol}`)
      return response.data
    } catch (error) {
      console.error('Error fetching current price:', error)
      throw error
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await api.get('/trading/account')
      return response.data
    } catch (error) {
      console.error('Error fetching account information:', error)
      throw error
    }
  }

  async placeBinanceOrder(order: Partial<BinanceOrder>): Promise<BinanceOrder> {
    try {
      const response = await api.post('/trading/order', order)
      return response.data
    } catch (error) {
      console.error('Error placing order:', error)
      throw error
    }
  }
}

export const tradingService = TradingService.getInstance()
