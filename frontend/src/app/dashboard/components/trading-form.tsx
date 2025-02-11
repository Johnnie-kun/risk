'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { tradingService } from '@/services/tradingService'
import { toast } from '@/components/ui/use-toast'
import { Card } from "@/components/ui/card"
import { Calculator } from 'lucide-react'

interface TradingFormProps {
  symbol: string
  currentPrice: number
  balance?: number
}

interface OrderPreview {
  entryPrice: number
  stopLoss?: number
  takeProfit?: number
  amount: number
  total: number
  leverage: number
  potentialProfit?: number
  potentialLoss?: number
  liquidationPrice?: number
}

export default function TradingForm({ symbol, currentPrice, balance = 0 }: TradingFormProps) {
  const [orderType, setOrderType] = React.useState<'market' | 'limit'>('market')
  const [side, setSide] = React.useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [stopLoss, setStopLoss] = React.useState('')
  const [takeProfit, setTakeProfit] = React.useState('')
  const [leverage, setLeverage] = React.useState(1)
  const [isMargin, setIsMargin] = React.useState(false)
  const [riskPercent, setRiskPercent] = React.useState(1)
  const [showPositionSizer, setShowPositionSizer] = React.useState(false)
  const [orderPreview, setOrderPreview] = React.useState<OrderPreview | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Calculate position size based on risk percentage
  const calculatePositionSize = React.useCallback(() => {
    if (!stopLoss || !balance) return

    const entryPrice = orderType === 'market' ? currentPrice : Number(price)
    const stopLossPrice = Number(stopLoss)
    
    // Calculate risk amount
    const riskAmount = (balance * riskPercent) / 100
    
    // Calculate position size
    const priceDifference = Math.abs(entryPrice - stopLossPrice)
    const positionSize = (riskAmount / priceDifference) * leverage
    
    setAmount(positionSize.toFixed(8))
  }, [balance, riskPercent, stopLoss, price, currentPrice, orderType, leverage])

  // Update preview whenever inputs change
  React.useEffect(() => {
    if (!amount) return

    const entryPrice = orderType === 'market' ? currentPrice : Number(price)
    const positionSize = Number(amount)
    const total = positionSize * entryPrice / leverage

    const preview: OrderPreview = {
      entryPrice,
      amount: positionSize,
      total,
      leverage,
    }

    if (stopLoss) {
      const stopLossPrice = Number(stopLoss)
      const potentialLoss = Math.abs(entryPrice - stopLossPrice) * positionSize
      preview.stopLoss = stopLossPrice
      preview.potentialLoss = potentialLoss
    }

    if (takeProfit) {
      const takeProfitPrice = Number(takeProfit)
      const potentialProfit = Math.abs(entryPrice - takeProfitPrice) * positionSize
      preview.takeProfit = takeProfitPrice
      preview.potentialProfit = potentialProfit
    }

    // Calculate liquidation price for margin trades
    if (isMargin) {
      const maintenanceMargin = 0.005 // 0.5%
      const liquidationPrice = side === 'buy'
        ? entryPrice * (1 - (1 / leverage) + maintenanceMargin)
        : entryPrice * (1 + (1 / leverage) - maintenanceMargin)
      preview.liquidationPrice = liquidationPrice
    }

    setOrderPreview(preview)
  }, [amount, price, stopLoss, takeProfit, leverage, isMargin, currentPrice, orderType, side])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || (orderType === 'limit' && !price)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      await tradingService.placeOrder({
        symbol,
        side,
        type: orderType,
        amount: parseFloat(amount),
        leverage: isMargin ? leverage : 1,
        ...(orderType === 'limit' && { price: parseFloat(price) }),
        ...(stopLoss && { stopLoss: parseFloat(stopLoss) }),
        ...(takeProfit && { takeProfit: parseFloat(takeProfit) })
      })

      toast({
        title: "Success",
        description: `${side.toUpperCase()} order placed successfully`,
      })

      // Reset form
      setAmount('')
      if (orderType === 'limit') setPrice('')
      setStopLoss('')
      setTakeProfit('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
        {/* Order Type Selection */}
        <Tabs value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
          <TabsList className="w-full">
            <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
            <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Toggle */}
        <ToggleGroup type="single" value={side} onValueChange={(value: 'buy' | 'sell') => setSide(value)} className="mt-4">
          <ToggleGroupItem 
            value="buy" 
            className="flex-1 data-[state=on]:bg-green-500"
          >
            Buy
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="sell" 
            className="flex-1 data-[state=on]:bg-red-500"
          >
            Sell
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Margin Trading Toggle */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-300">Margin Trading</span>
          <Switch
            checked={isMargin}
            onCheckedChange={setIsMargin}
          />
        </div>

        {/* Leverage Slider (only shown when margin trading is enabled) */}
        {isMargin && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Leverage</span>
              <span className="text-sm text-gray-300">{leverage}x</span>
            </div>
            <Slider
              value={[leverage]}
              onValueChange={([value]) => setLeverage(value)}
              min={1}
              max={100}
              step={1}
            />
          </div>
        )}

        {/* Position Sizer */}
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4"
          onClick={() => setShowPositionSizer(!showPositionSizer)}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Position Size Calculator
        </Button>

        {showPositionSizer && (
          <div className="mt-4 space-y-4 p-4 bg-gray-900 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Risk (%)</label>
              <Slider
                value={[riskPercent]}
                onValueChange={([value]) => setRiskPercent(value)}
                min={0.1}
                max={5}
                step={0.1}
              />
              <div className="text-sm text-gray-400">
                Risk Amount: ${((balance * riskPercent) / 100).toFixed(2)}
              </div>
            </div>
            <Button
              type="button"
              onClick={calculatePositionSize}
              className="w-full"
            >
              Calculate Position Size
            </Button>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2 mt-4">
          <label className="text-sm text-gray-300">Amount (BTC)</label>
          <Input
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-700"
          />
        </div>

        {/* Price Input (for Limit Orders) */}
        {orderType === 'limit' && (
          <div className="space-y-2 mt-4">
            <label className="text-sm text-gray-300">Price (USD)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-700"
            />
          </div>
        )}

        {/* Stop Loss */}
        <div className="space-y-2 mt-4">
          <label className="text-sm text-gray-300">Stop Loss (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="bg-gray-700"
          />
        </div>

        {/* Take Profit */}
        <div className="space-y-2 mt-4">
          <label className="text-sm text-gray-300">Take Profit (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="bg-gray-700"
          />
        </div>

        {/* Order Preview */}
        {orderPreview && (
          <Card className="mt-4 p-4 bg-gray-900">
            <h3 className="text-lg font-semibold mb-2">Order Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Entry Price:</span>
                <span>${orderPreview.entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Position Size:</span>
                <span>{orderPreview.amount.toFixed(8)} BTC</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${orderPreview.total.toFixed(2)}</span>
              </div>
              {orderPreview.stopLoss && (
                <div className="flex justify-between">
                  <span>Potential Loss:</span>
                  <span className="text-red-500">
                    ${orderPreview.potentialLoss?.toFixed(2)}
                  </span>
                </div>
              )}
              {orderPreview.takeProfit && (
                <div className="flex justify-between">
                  <span>Potential Profit:</span>
                  <span className="text-green-500">
                    ${orderPreview.potentialProfit?.toFixed(2)}
                  </span>
                </div>
              )}
              {isMargin && orderPreview.liquidationPrice && (
                <div className="flex justify-between text-red-500">
                  <span>Liquidation Price:</span>
                  <span>${orderPreview.liquidationPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className={`w-full mt-4 ${side === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
        </Button>
      </div>
    </form>
  )
} 