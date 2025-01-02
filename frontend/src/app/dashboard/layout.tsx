import React from "react"
import Navigation from "./components/navigation"
import RiskAlerts from "./components/risk-alerts"
import PriceChart from "./components/price-chart"
import TradingInterface from "./page" // Importing the TradingInterface

const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex flex-1">
        <div className="flex-1 p-4">
          {/* Main content area for TradingInterface */}
          {children}
        </div>
        <div className="w-1/3 p-4">
          {/* Sidebar for Risk Alerts and Price Chart */}
          <RiskAlerts />
          <PriceChart />
        </div>
      </div>
    </div>
  )
}

export default Layout
