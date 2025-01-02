'use client'

import React from "react"
import Navigation from "./components/navigation"
import { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Main content area for TradingInterface */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
