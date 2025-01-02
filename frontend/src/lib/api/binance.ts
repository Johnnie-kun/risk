// Import necessary modules
import axios from 'axios';

// Define the base URL for Binance API
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// Function to get current price of a symbol
export const getCurrentPrice = async (symbol: string) => {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price?symbol=${symbol}`);
    return response.data;
};

// Function to get account information
export const getAccountInfo = async (apiKey: string) => {
    const response = await axios.get(`${BINANCE_API_URL}/account`, {
        headers: { 'X-MBX-APIKEY': apiKey }
    });
    return response.data;
};
