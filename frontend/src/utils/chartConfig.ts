import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
  } from "chart.js";
  
  // Register ChartJS components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Optional: For adding fill effects like gradients
  );
  
  // Default chart options
  export const defaultChartOptions: ChartOptions = {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: false, // Allow the chart to resize freely
    plugins: {
      legend: {
        position: "top" as const, // Position the legend at the top
        labels: {
          font: {
            size: 12, // Customize font size
            family: "Arial, sans-serif", // Customize font family
          },
          color: "#333", // Legend label color
        },
      },
      title: {
        display: true, // Display the chart title
        text: "Bitcoin Price Chart", // Chart title text
        font: {
          size: 18, // Customize title font size
          family: "Arial, sans-serif", // Customize font family
        },
        color: "#000", // Title color
      },
      tooltip: {
        enabled: true, // Enable tooltips
        callbacks: {
          label: function (context) {
            // Format tooltip labels
            const value = context.raw as number;
            return `Price: $${value.toFixed(2)}`; // Display price with 2 decimal places
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Tooltip background color
        titleColor: "#fff", // Tooltip title color
        bodyColor: "#fff", // Tooltip body text color
        borderColor: "#fff", // Tooltip border color
        borderWidth: 1, // Tooltip border width
      },
    },
    scales: {
      x: {
        title: {
          display: true, // Display the x-axis title
          text: "Time", // X-axis title text
          font: {
            size: 14, // Customize font size
            family: "Arial, sans-serif", // Customize font family
          },
          color: "#666", // X-axis title color
        },
        grid: {
          display: true, // Display grid lines for the x-axis
          color: "rgba(200, 200, 200, 0.2)", // Grid line color
        },
      },
      y: {
        beginAtZero: false, // Do not start the y-axis at zero
        title: {
          display: true, // Display the y-axis title
          text: "Price (USD)", // Y-axis title text
          font: {
            size: 14, // Customize font size
            family: "Arial, sans-serif", // Customize font family
          },
          color: "#666", // Y-axis title color
        },
        ticks: {
          callback: (value: number | string) => `$${value}`, // Format y-axis labels
        },
        grid: {
          display: true, // Display grid lines for the y-axis
          color: "rgba(200, 200, 200, 0.2)", // Grid line color
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Add a slight curve to the line
        borderWidth: 2, // Line thickness
      },
      point: {
        radius: 4, // Point size
        hoverRadius: 6, // Point size on hover
      },
    },
  };
