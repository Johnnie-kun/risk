'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/index"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'

export default function TradingInterface() {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = React.useState('')
  const [tradeType, setTradeType] = React.useState('futures')

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: input }])
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'This is a simulated trading assistant response.' 
      }])
    }, 1000)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">BTCUSDT</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white">74,991.9</span>
            <span className="text-green-400">+0.89%</span>
          </div>
        </div>
        <div className="w-[200px]">
          <Tabs value={tradeType} onValueChange={(value) => setTradeType(value)} className="w-full">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="futures" className="flex-1 data-[state=active]:bg-gray-700">Futures</TabsTrigger>
              <TabsTrigger value="spot" className="flex-1 data-[state=active]:bg-gray-700">Spot</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 bg-gray-900">
        {/* Order Book */}
        <div className="w-[300px] border-r border-gray-700">
          <Tabs defaultValue="order-book" className="h-full">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="order-book" className="flex-1 data-[state=active]:bg-gray-700">Order Book</TabsTrigger>
              <TabsTrigger value="trades" className="flex-1 data-[state=active]:bg-gray-700">Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="order-book" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-3 text-sm p-2 text-gray-400">
                  <div>Price(USDT)</div>
                  <div>Size(USDT)</div>
                  <div>Sum(USDT)</div>
                </div>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-3 text-sm p-2 hover:bg-gray-700">
                    <div className="text-red-400">74,993.9</div>
                    <div className="text-gray-300">150.0</div>
                    <div className="text-gray-300">578.94K</div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="trades" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 hover:bg-gray-700">
                    <span className="text-green-400">74,992.0</span>
                    <span className="text-gray-300">0.5 BTC</span>
                    <span className="text-gray-400">15:40:13</span>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chart Area */}
        <div className="flex-1 border-r border-gray-700 p-4">
          <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            Trading Chart Placeholder
          </div>
        </div>

        {/* Chat Assistant */}
        <div className="w-[300px] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div key={i} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-lg p-2 ${
                    message.role === 'assistant' ? 'bg-gray-700 text-gray-300' : 'bg-blue-600 text-white'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about trading..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 p-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}