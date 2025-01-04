import { useState, useEffect } from "react"
import axios from "axios"

// Replace this with your actual API endpoint
const API_URL = "https://yourapi.com/auth/user"

interface User {
  id: string
  username: string
  email: string
  // Add other user properties as needed
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate fetching user data securely
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(API_URL, { withCredentials: true })
        setUser(response.data)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to fetch user data.")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, []) // Empty dependency array ensures this runs only once when the component mounts

  return { user, loading, error }
}

export default useAuth
