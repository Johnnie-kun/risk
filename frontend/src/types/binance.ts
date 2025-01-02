import axios from "axios"
import type { BinanceTicker, BinanceOrder } from "."

// Function to fetch the ticker data for a symbol
const getBinanceTicker = async (symbol: string): Promise<BinanceTicker> => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`, {
      params: { symbol },
    })

    // Returning response structured according to BinanceTicker interface
    return {
      symbol: response.data.symbol,
      price: response.data.lastPrice,
      volume: response.data.volume,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('An unknown error occurred')
    }
    throw new Error("Failed to fetch ticker data")
  }
}

// Function to fetch an order by its ID
const getBinanceOrder = async (orderId: string): Promise<BinanceOrder> => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/order`, {
      params: { orderId },
    })

    // Returning response structured according to BinanceOrder interface
    return {
      orderId: response.data.orderId,
      symbol: response.data.symbol,
      price: response.data.price,
      quantity: response.data.origQty,
      status: response.data.status,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('An unknown error occurred')
    }
    throw new Error("Failed to fetch order data")
  }
}

// Example usage
const fetchTicker = async () => {
  try {
    const ticker = await getBinanceTicker("BTCUSDT")
    console.log(ticker) // { symbol: 'BTCUSDT', price: '40000.00', volume: '1200.5' }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('An unknown error occurred')
    }
  }
}

const fetchOrder = async () => {
  try {
    const order = await getBinanceOrder("123456789")
    console.log(order) // { orderId: '123456789', symbol: 'BTCUSDT', price: '40000.00', quantity: '0.5', status: 'FILLED' }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('An unknown error occurred')
    }
  }
}

export { getBinanceTicker, getBinanceOrder, fetchTicker, fetchOrder }