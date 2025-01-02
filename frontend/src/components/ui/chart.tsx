"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, data, options, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-full", className)}
        {...props}
        role="img" // Accessibility: Indicate this is an image/chart
        aria-label="Chart"
      >
        <Line data={data} options={options} />
      </div>
    )
  }
)
Chart.displayName = "Chart"

export { Chart } 