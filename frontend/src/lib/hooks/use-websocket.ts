import { useEffect, useRef, useState } from "react"

interface WebSocketMessage {
  // Define the structure of your WebSocket message
  type: string
  data: { payload: string }
}

const useWebSocket = (url: string) => {
  const socketRef = useRef<WebSocket | null>(null)
  const [message, setMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    // Initialize the WebSocket connection
    socketRef.current = new WebSocket(url)

    // Event listeners for WebSocket events
    socketRef.current.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setError(null) // Reset error state on successful connection
    }

    socketRef.current.onmessage = (event) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(event.data)
        setMessage(parsedMessage)
      } catch (err) {
        console.error("Error parsing WebSocket message:", err)
        setError("Failed to parse message")
      }
    }

    socketRef.current.onerror = () => {
      console.error("WebSocket error")
      setError("WebSocket connection error")
    }

    socketRef.current.onclose = (event) => {
      console.log("WebSocket closed", event.reason)
      setIsConnected(false)
      setError(null) // Reset error state on close
    }

    // Cleanup the WebSocket connection on component unmount
    return () => {
      socketRef.current?.close()
    }
  }, [url])

  const sendMessage = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data)
    } else {
      setError("WebSocket is not open")
    }
  }

  return {
    isConnected,
    message,
    error,
    sendMessage,
  }
}

export default useWebSocket
