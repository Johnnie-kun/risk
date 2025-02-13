'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  ColorType,
  Time,
  MouseEventParams,
  ChartOptions,
  IChartApi,
  ISeriesApi,
  SeriesType,
  SeriesOptionsMap,
  CandlestickData,
  HistogramData,
  LineData,
  SeriesDefinition,
  CandlestickSeriesOptions,
  HistogramSeriesOptions,
  LineSeriesOptions
} from 'lightweight-charts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pencil, MousePointer, LineChart } from 'lucide-react'

interface ChartData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface PriceChartProps {
  data?: ChartData[]
  width?: number
  height?: number
  onCrosshairMove?: (price: number | null) => void
}

// Technical indicator calculations
const calculateRSI = (data: ChartData[], periods = 14) => {
  let gains = 0
  let losses = 0
  const rsiData: { time: string, value: number }[] = []

  // Initial RSI calculation
  for (let i = 1; i < periods + 1; i++) {
    const difference = data[i].close - data[i - 1].close
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
    const difference = data[i].close - data[i - 1].close
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

const calculateMACD = (data: ChartData[], fastPeriods = 12, slowPeriods = 26, signalPeriods = 9) => {
  const closes = data.map(d => d.close)
  const fastEMA = calculateEMA(closes, fastPeriods)
  const slowEMA = calculateEMA(closes, slowPeriods)
  
  const macdLine = fastEMA.map((fast, i) => ({
    time: data[i].time,
    value: fast - slowEMA[i]
  }))
  
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
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null)
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<'Candlestick'> | null>(null)
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<'Histogram'> | null>(null)
  const [rsiSeries, setRsiSeries] = useState<ISeriesApi<'Line'> | null>(null)
  const [macdLineSeries, setMacdLineSeries] = useState<ISeriesApi<'Line'> | null>(null)
  const [macdSignalSeries, setMacdSignalSeries] = useState<ISeriesApi<'Line'> | null>(null)
  
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
    } as ChartOptions)

    // Create series
    // @ts-ignore
    const candlestick = chart.addSeries('candlestick', {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // @ts-ignore
    const volume = chart.addSeries('histogram', {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })

    // @ts-ignore
    const rsi = chart.addSeries('line', {
      color: '#f48fb1',
      lineWidth: 2,
      priceScaleId: 'rsi',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // @ts-ignore
    const macdLine = chart.addSeries('line', {
      color: '#2196f3',
      lineWidth: 2,
      priceScaleId: 'macd',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // @ts-ignore
    const macdSignal = chart.addSeries('line', {
      color: '#ff9800',
      lineWidth: 2,
      priceScaleId: 'macd',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // Store references with type assertions
    setChartInstance(chart)
    // @ts-ignore
    setCandlestickSeries(candlestick)
    // @ts-ignore
    setVolumeSeries(volume)
    // @ts-ignore
    setRsiSeries(rsi)
    // @ts-ignore
    setMacdLineSeries(macdLine)
    // @ts-ignore
    setMacdSignalSeries(macdSignal)

    // Set data with proper types
    if (data.length > 0) {
      candlestick.setData(data as CandlestickData<Time>[])
      
      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      })) as HistogramData<Time>[]
      volume.setData(volumeData)

      const rsiData = calculateRSI(data)
      rsi.setData(rsiData as LineData<Time>[])

      const macdData = calculateMACD(data)
      macdLine.setData(macdData.macdLine as LineData<Time>[])
      macdSignal.setData(macdData.signalLine as LineData<Time>[])
    }

    // Subscribe to crosshair move
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
        if (
          !param ||
          !param.time ||
          !param.point ||
          param.point.x < 0 ||
          param.point.y < 0
        ) {
          onCrosshairMove(null)
          return
        }
        
        const price = candlestick.coordinateToPrice(param.point.y)
        if (price !== null) {
          onCrosshairMove(price)
        }
      })
    }

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

  // Remove drawing tool related code since it's not supported
  useEffect(() => {
    if (!chartInstance) return
    
    // Reset any custom tools/overlays when tool changes
    switch (selectedTool) {
      case 'line':
        // Implement custom line drawing if needed
        break
      case 'pencil':
        // Implement custom freehand drawing if needed
        break
      default:
        // Pointer mode - default behavior
        break
    }
  }, [selectedTool, chartInstance])

  return (
    <div className="bg-[#1a1b1e] p-6 rounded-lg shadow-lg border border-[#2b2f36]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Bitcoin Price Chart</h2>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1H">1H</SelectItem>
              <SelectItem value="4H">4H</SelectItem>
              <SelectItem value="1D">1D</SelectItem>
              <SelectItem value="1W">1W</SelectItem>
            </SelectContent>
          </Select>

          {/* Drawing tools */}
          <div className="flex space-x-2">
            <Button
              variant={selectedTool === 'pointer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('pointer')}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('line')}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === 'pencil' ? 'default' : 'outline'}
              size="sm"
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
        className="w-full h-full chart-container"
      />
    </div>
  )
}

export default PriceChart
