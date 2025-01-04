import axios from "axios"

// Define the base URL for Binance API
const BINANCE_API_URL = "https://api.binance.com/api/v3"

// Function to get current price of a symbol
export const getCurrentPrice = async (symbol: string) => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
      params: { symbol },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching current price:", error)
    throw new Error("Failed to fetch current price")
  }
}

// Function to get account information
export const getAccountInfo = async (apiKey: string) => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/account`, {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching account information:", error)
    throw new Error("Failed to fetch account information")
  }
}