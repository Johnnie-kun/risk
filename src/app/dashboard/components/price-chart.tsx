const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Bitcoin Price Over Time',
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Price in USD'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Months'
      }
    }
  }
} 