'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts'
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pencil, MousePointer, LineChart } from 'lucide-react'

interface PriceChartProps {
  data?: {
    time: string  // Timestamp in ISO format
    open: number
    high: number
    low: number
    close: number
    volume?: number
  }[]
  width?: number
  height?: number
  onCrosshairMove?: (price: number | null) => void
}

// Technical indicator calculations
const calculateRSI = (data: number[], periods = 14) => {
  let gains = 0
  let losses = 0
  const rsiData: { time: string, value: number }[] = []

  // Initial RSI calculation
  for (let i = 1; i < periods + 1; i++) {
    const difference = data[i] - data[i - 1]
    if (difference >= 0) {
      gains += difference
    } else {
      losses -= difference
    }
  }

  let avgGain = gains / periods
  let avgLoss = losses / periods
  let rs = avgGain / avgLoss
  let rsi = 100 - (100 / (1 + rs))

  // Calculate RSI for the rest of the data
  for (let i = periods + 1; i < data.length; i++) {
    const difference = data[i] - data[i - 1]
    avgGain = ((avgGain * (periods - 1)) + (difference > 0 ? difference : 0)) / periods
    avgLoss = ((avgLoss * (periods - 1)) + (difference < 0 ? -difference : 0)) / periods
    rs = avgGain / avgLoss
    rsi = 100 - (100 / (1 + rs))
    rsiData.push({
      time: data[i].time,
      value: rsi
    })
  }

  return rsiData
}

const calculateMACD = (data: number[], fastPeriods = 12, slowPeriods = 26, signalPeriods = 9) => {
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriods)
  const slowEMA = calculateEMA(data, slowPeriods)
  
  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => ({
    time: data[i].time,
    value: fast - slowEMA[i]
  }))
  
  // Calculate signal line (9-day EMA of MACD line)
  const signalLine = calculateEMA(macdLine.map(d => d.value), signalPeriods)
  
  return {
    macdLine,
    signalLine: signalLine.map((signal, i) => ({
      time: data[i].time,
      value: signal
    }))
  }
}

const calculateEMA = (data: number[], periods: number) => {
  const multiplier = 2 / (periods + 1)
  const ema = [data[0]]
  
  for (let i = 1; i < data.length; i++) {
    ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1])
  }
  
  return ema
}

const PriceChart = ({ 
  data = [], 
  width = 800, 
  height = 400,
  onCrosshairMove 
}: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdSignalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  
  const [timeframe, setTimeframe] = useState('1D')
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'line' | 'pencil'>('pointer')
  const [showRSI, setShowRSI] = useState(false)
  const [showMACD, setShowMACD] = useState(false)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create the main chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: '#1a1b1e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2b2f36' },
        horzLines: { color: '#2b2f36' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 4,
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0,
        },
        horzLine: {
          color: 'rgba(224, 227, 235, 0.1)',
          labelBackgroundColor: '#2b2f36',
        },
      },
      rightPriceScale: {
        borderColor: '#2b2f36',
      },
      timeScale: {
        borderColor: '#2b2f36',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Create the candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
    })

    // Create RSI series
    const rsiSeries = chart.addLineSeries({
      color: '#f48fb1',
      lineWidth: 2,
      priceScaleId: 'rsi',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // Create MACD series
    const macdLineSeries = chart.addLineSeries({
      color: '#2196f3',
      lineWidth: 2,
      priceScaleId: 'macd',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    const macdSignalSeries = chart.addLineSeries({
      color: '#ff9800',
      lineWidth: 2,
      priceScaleId: 'macd',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // Set the data
    if (data.length > 0) {
      candlestickSeries.setData(data)
      
      // Set volume data
      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      }))
      volumeSeries.setData(volumeData)

      // Calculate and set RSI data
      const closes = data.map(d => d.close)
      const rsiData = calculateRSI(closes)
      rsiSeries.setData(rsiData)

      // Calculate and set MACD data
      const macdData = calculateMACD(closes)
      macdLineSeries.setData(macdData.macdLine)
      macdSignalSeries.setData(macdData.signalLine)
    }

    // Subscribe to crosshair move if callback provided
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove(param => {
        if (
          param === undefined || 
          param.time === undefined || 
          param.point === undefined || 
          param.point.x < 0 || 
          param.point.y < 0
        ) {
          onCrosshairMove(null)
          return
        }
        const price = param.seriesPrices.get(candlestickSeries)
        if (price) {
          onCrosshairMove(price as number)
        }
      })
    }

    // Store references
    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries
    volumeSeriesRef.current = volumeSeries
    rsiSeriesRef.current = rsiSeries
    macdLineSeriesRef.current = macdLineSeries
    macdSignalSeriesRef.current = macdSignalSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, width, height, onCrosshairMove])

  // Handle timeframe changes
  useEffect(() => {
    // Here you would fetch new data based on the timeframe
    // and update the chart
  }, [timeframe])

  // Handle drawing tool changes
  useEffect(() => {
    if (!chartRef.current) return

    // Disable previous drawing tools
    chartRef.current.clearDrawingTools()

    // Enable selected drawing tool
    switch (selectedTool) {
      case 'line':
        chartRef.current.enableDrawingTool('line')
        break
      case 'pencil':
        chartRef.current.enableDrawingTool('freehand')
        break
      default:
        // Pointer mode - no drawing tools enabled
        break
    }
  }, [selectedTool])

  return (
    <div className="bg-[#1a1b1e] p-6 rounded-lg shadow-lg border border-[#2b2f36]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Bitcoin Price Chart</h2>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe selector */}
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
            options={[
              { value: '1H', label: '1H' },
              { value: '4H', label: '4H' },
              { value: '1D', label: '1D' },
              { value: '1W', label: '1W' },
            ]}
            className="w-24"
          />

          {/* Drawing tools */}
          <div className="flex space-x-2">
            <Button
              variant={selectedTool === 'pointer' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setSelectedTool('pointer')}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === 'line' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setSelectedTool('line')}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === 'pencil' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setSelectedTool('pencil')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex space-x-2">
            <Button
              variant={showRSI ? 'default' : 'outline'}
              onClick={() => setShowRSI(!showRSI)}
            >
              RSI
            </Button>
            <Button
              variant={showMACD ? 'default' : 'outline'}
              onClick={() => setShowMACD(!showMACD)}
            >
              MACD
            </Button>
          </div>
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  )
}

export default PriceChart
