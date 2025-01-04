import axios from "axios"

// Define the base URL for the API
const API_URL = "https://yourapi.com/auth"

// Function to log in a user
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password })
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Failed to log in. Please check your credentials.")
  }
}

// Function to log out a user
export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`)
    return response.data
  } catch (error) {
    console.error("Logout error:", error)
    throw new Error("Failed to log out. Please try again.")
  }
}