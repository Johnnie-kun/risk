import type { AuthResponse } from "./types"

interface ApiResponse {
  userId: string
  username: string
  email: string
  token: string
  expiresIn: number
}

// Simulating a login function
const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    // Replace with actual login logic (e.g., API call)
    const response = await fakeApiCall(username, password) // Example fake API call

    // Return response structured according to AuthResponse interface
    return {
      user: {
        id: response.userId,
        username: response.username,
        email: response.email,
        token: response.token,
      },
      expiresIn: response.expiresIn, // Token expiration time
    }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Failed to log in. Please check your credentials.")
  }
}

// Example fake API call function (for demonstration purposes)
const fakeApiCall = (username: string, password: string): Promise<ApiResponse> => {
  // Simulate a successful login response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === "test" && password === "password") {
        resolve({
          userId: "123",
          username: username,
          email: `${username}@example.com`,
          token: "abcd1234", // Simulated token
          expiresIn: 3600, // Token expires in 1 hour (3600 seconds)
        })
      } else {
        reject(new Error("Invalid username or password"))
      }
    }, 1000)
  })
}

export { login }