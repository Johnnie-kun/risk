import React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

const PriceChart: React.FC = () => {
  // Example data for the chart
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], // X-axis labels (months)
    datasets: [
      {
        label: "BTC Price",
        data: [40000, 42000, 41000, 45000, 47000, 46000], // Y-axis data (prices)
        borderColor: "rgba(75, 192, 192, 1)", // Line color
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Line area fill color
        fill: true, // Fill under the line
        tension: 0.1, // Curve the line
      },
    ],
  }

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Bitcoin Price Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: "Price in USD",
        },
      },
    },
  }

  return (
    <div className="bg-card p-6 rounded-md shadow-lg border border-border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Price Chart</h2>
      <Line data={data} options={options} />
    </div>
  )
}

export default PriceChart
