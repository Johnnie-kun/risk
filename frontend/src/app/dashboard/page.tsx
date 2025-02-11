'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'
import { webSocketService } from '@/services/websocket.service'
import { chatService, ChatMessage } from '@/services/chat.service'
import PriceChart from './components/price-chart'
import TradingForm from './components/trading-form'
import PositionsOrders from './components/positions-orders'
import { tradingService, OrderBook, HistoricalData } from '@/services/tradingService'

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

interface Trade {
  price: number
  amount: number
  side: 'buy' | 'sell'
  timestamp: number
}

const SYMBOL = 'BTCUSDT'
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
type Timeframe = typeof TIMEFRAMES[number]

export default function TradingInterface() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [currentPrice, setCurrentPrice] = React.useState<number>(0)
  const [orderBook, setOrderBook] = React.useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({
    bids: [],
    asks: []
  })
  const [trades, setTrades] = React.useState<Trade[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<Timeframe>('1h')
  const [chartData, setChartData] = React.useState<HistoricalData[]>([])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Fetch historical data
  const fetchHistoricalData = React.useCallback(async () => {
    try {
      const data = await tradingService.getHistoricalData(SYMBOL, selectedTimeframe)
      setChartData(data)
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
    }
  }, [selectedTimeframe])

  React.useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  React.useEffect(() => {
    webSocketService.connect()

    const handlePriceUpdate = (data: { price: number }) => setCurrentPrice(data.price)
    const handleOrderBookUpdate = (data: { bids: Array<[number, number]>, asks: Array<[number, number]> }) => {
      const processOrders = (orders: Array<[number, number]>): OrderBookEntry[] => {
        let total = 0
        return orders.map(([price, size]) => {
          total += size
          return { price, size, total }
        })
      }

      setOrderBook({
        bids: processOrders(data.bids),
        asks: processOrders(data.asks)
      })
    }
    const handleTradeUpdate = (data: Trade) => setTrades(prev => [data, ...prev].slice(0, 50))
    const handleChartUpdate = (data: HistoricalData) => {
      setChartData(prev => {
        const newData = [...prev]
        const lastIndex = newData.length - 1
        if (newData[lastIndex]?.time === data.time) {
          newData[lastIndex] = data
        } else {
          newData.push(data)
        }
        return newData
      })
    }

    webSocketService.subscribeToPriceUpdates(handlePriceUpdate)
    webSocketService.subscribeToOrderBookUpdates(handleOrderBookUpdate)
    webSocketService.subscribeToTradeUpdates(handleTradeUpdate)
    webSocketService.subscribeToChartData(handleChartUpdate)

    return () => {
      webSocketService.unsubscribeFromPriceUpdates(handlePriceUpdate)
      webSocketService.unsubscribeFromOrderBookUpdates(handleOrderBookUpdate)
      webSocketService.unsubscribeFromTradeUpdates(handleTradeUpdate)
      webSocketService.unsubscribeFromChartData(handleChartUpdate)
      webSocketService.disconnect()
    }
  }, [])

  // Fetch chat history
  React.useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const history = await chatService.getChatHistory()
        setMessages(history)
      } catch (error) {
        console.error('Error fetching chat history:', error)
      }
    }

    fetchChatHistory()
  }, [])

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const response = await chatService.sendMessage(input)
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now(),
          content: input,
          role: 'user',
          timestamp: new Date(),
          userId: 0
        },
        {
          id: Date.now() + 1,
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          userId: 0
        }
      ])
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{SYMBOL}</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white">{formatPrice(currentPrice)}</span>
            <span className="text-green-400">+0.89%</span>
          </div>
        </div>
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 bg-gray-900">
        {/* Order Book */}
        <div className="w-[300px] border-r border-gray-700">
          <Tabs defaultValue="order-book" className="h-full">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="order-book" className="flex-1">Order Book</TabsTrigger>
              <TabsTrigger value="trades" className="flex-1">Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="order-book" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-3 text-sm p-2 text-gray-400">
                  <div>Price(USDT)</div>
                  <div>Size(BTC)</div>
                  <div>Sum(BTC)</div>
                </div>
                {orderBook.asks.slice().reverse().map((ask, i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-3 text-sm p-2 hover:bg-gray-700">
                    <div className="text-red-400">{formatPrice(ask.price)}</div>
                    <div className="text-gray-300">{ask.size.toFixed(4)}</div>
                    <div className="text-gray-300">{ask.total.toFixed(4)}</div>
                  </div>
                ))}
                <div className="border-t border-b border-gray-700 py-2 text-center text-xl font-semibold text-white">
                  {formatPrice(currentPrice)}
                </div>
                {orderBook.bids.map((bid, i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-3 text-sm p-2 hover:bg-gray-700">
                    <div className="text-green-400">{formatPrice(bid.price)}</div>
                    <div className="text-gray-300">{bid.size.toFixed(4)}</div>
                    <div className="text-gray-300">{bid.total.toFixed(4)}</div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="trades" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                {trades.map((trade, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 hover:bg-gray-700">
                    <span className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {formatPrice(trade.price)}
                    </span>
                    <span className="text-gray-300">{trade.amount.toFixed(4)}</span>
                    <span className="text-gray-400">{formatTime(trade.timestamp)}</span>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chart and Trading Area */}
        <div className="flex-1 flex flex-col border-r border-gray-700">
          {/* Chart */}
          <div className="flex-1 p-4">
            <PriceChart 
              data={chartData}
              height={500}
              onCrosshairMove={(price) => {
                if (price) setCurrentPrice(price)
              }}
            />
          </div>
          
          {/* Trading Form */}
          <div className="p-4 border-t border-gray-700">
            <TradingForm symbol={SYMBOL} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Positions, Orders, and Chat */}
        <div className="w-[300px] flex flex-col">
          {/* Positions and Orders */}
          <div className="flex-1 border-b border-gray-700">
            <PositionsOrders />
          </div>

          {/* Chat Assistant */}
          <div className="h-[400px] flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about trading..."
                  className="bg-gray-700"
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-10 h-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}