import { Line } from "react-chartjs-2";
import { ChartOptions } from 'chart.js';

interface BitcoinPriceChartProps {
  data: {
    labels: string[]; // Array of time labels (e.g., timestamps)
    prices: number[]; // Array of Bitcoin prices
  };
}

const defaultChartOptions: ChartOptions<'line'> = {
  scales: {
    x: {
      type: 'time',
    },
    y: {
      type: 'linear',
    },
  },
};

export function BitcoinPriceChart({ data }: BitcoinPriceChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Bitcoin Price (USD)",
        data: data.prices,
        borderColor: "rgb(75, 192, 192)", // Aqua line color
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill color below the line
        pointBackgroundColor: "rgb(75, 192, 192)", // Point colors
        pointBorderColor: "#fff", // White border for points
        pointRadius: 3, // Point size
        pointHoverRadius: 5, // Point size on hover
        tension: 0.3, // Smoother curve
        fill: true, // Enable fill below the line
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[400px] p-4 bg-white shadow-md rounded-lg">
      <Line options={defaultChartOptions} data={chartData} />
    </div>
  );
}