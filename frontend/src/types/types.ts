export interface User {
  id: string
  username: string
  email: string
  token: string
}

export interface AuthResponse {
  user: User
  expiresIn: number
}

export interface BinanceTicker {
  symbol: string
  price: string
  volume: string
}

export interface BinanceOrder {
  orderId: string
  symbol: string
  price: string
  quantity: string
  status: string
} 