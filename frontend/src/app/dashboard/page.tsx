'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'

export default function TradingInterface() {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = React.useState('')

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
    <div className="flex flex-col h-screen bg-background text-foreground dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">BTCUSDT</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white">74,991.9</span>
            <span className="text-green-400">+0.89%</span>
          </div>
        </div>
        <ToggleGroup type="single" defaultValue="futures" className="bg-gray-700 rounded-md">
          <ToggleGroupItem value="futures" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Futures</ToggleGroupItem>
          <ToggleGroupItem value="spot" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Spot</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <p className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input field and send button */}
        <div className="flex gap-2">
          <Input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-[#2b2f36] text-white placeholder:text-gray-500 flex-1"
          />
          <Button 
            onClick={handleSend} 
            className="h-12 w-12 bg-blue-500 text-white flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}