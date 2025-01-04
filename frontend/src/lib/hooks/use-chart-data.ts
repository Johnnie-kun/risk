import { useState, useEffect } from "react"
import axios from "axios"

// Replace this URL with your actual chart data API endpoint
const CHART_API_URL = "https://api.example.com/chart-data"

interface ChartData {
  timestamp: string
  value: number
}

const useChartData = (chartId: string) => {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get<ChartData[]>(`${CHART_API_URL}?chartId=${chartId}`)
        setData(response.data) // Assuming response.data is an array of chart data
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError("Failed to fetch chart data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [chartId]) // Re-fetch when chartId changes

  return { data, loading, error }
}

export default useChartData
