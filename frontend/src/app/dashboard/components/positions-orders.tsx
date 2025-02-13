'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { tradingService, Order, Position } from '@/services/tradingService'
import { toast } from '@/components/ui'

export default function PositionsOrders() {
  const [positions, setPositions] = React.useState<Position[]>([])
  const [orders, setOrders] = React.useState<Order[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      const [positionsData, ordersData] = await Promise.all([
        tradingService.getPositions(),
        tradingService.getOrders()
      ])
      setPositions(positionsData)
      setOrders(ordersData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch positions and orders",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleClosePosition = async (symbol: string) => {
    try {
      await tradingService.closePosition(symbol)
      toast({
        title: "Success",
        description: "Position closed successfully"
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive"
      })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await tradingService.cancelOrder(orderId)
      toast({
        title: "Success",
        description: "Order cancelled successfully"
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">Loading...</div>
  }

  return (
    <Tabs defaultValue="positions" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="positions" className="flex-1">
          Positions ({positions.length})
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex-1">
          Orders ({orders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="positions">
        <ScrollArea className="h-[300px]">
          {positions.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No open positions</div>
          ) : (
            <div className="space-y-2">
              {positions.map((position) => (
                <div
                  key={position.symbol}
                  className="p-3 border border-gray-700 rounded-lg bg-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{position.symbol}</h4>
                      <p className={`text-sm ${position.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                        {position.side.toUpperCase()} {position.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Entry: ${position.entryPrice.toFixed(2)}</p>
                      <p className={`text-sm ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        PnL: ${position.unrealizedPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-400 hover:text-red-300"
                      onClick={() => handleClosePosition(position.symbol)}
                    >
                      Close Position
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="orders">
        <ScrollArea className="h-[300px]">
          {orders.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No open orders</div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 border border-gray-700 rounded-lg bg-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{order.symbol}</h4>
                      <p className={`text-sm ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {order.side.toUpperCase()} {order.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        {order.type === 'limit' ? `$${order.price?.toFixed(2)}` : 'Market'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-400 hover:text-red-300"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
} 