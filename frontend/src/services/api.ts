import axios from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'react-toastify';

// Base URL for the API
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create a pre-configured Axios instance
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for transient errors
axiosRetry(api, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff
  retryCondition: (error) => {
    if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
      return true; // Retry for network errors or idempotent requests
    }
    return error.response ? error.response.status >= 500 : false; // Retry for status codes 5xx
  },
});

// Add a request interceptor for authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Example: Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Attempt to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          toast.error('Session expired. Please log in again.');
          // Redirect to login page
          window.location.href = '/login';
        }
      } else {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }

    // Handle other errors
    if (error.response) {
      toast.error(error.response.data.message || 'An error occurred. Please try again later.');
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// TypeScript interfaces for API responses
interface BitcoinPriceHistory {
  timestamp: string;
  price: number;
}

interface BitcoinCurrentPrice {
  price: number;
  currency: string;
}

// Define the Bitcoin API endpoints
export const bitcoinApi = {
  getPriceHistory: async (timeframe: string): Promise<BitcoinPriceHistory[]> => {
    try {
      const response = await api.get(`/bitcoin/history/${timeframe}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching price history (${timeframe}):`, error);
      throw error;
    }
  },

  getCurrentPrice: async (): Promise<BitcoinCurrentPrice> => {
    try {
      const response = await api.get('/bitcoin/price');
      return response.data;
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  },
};