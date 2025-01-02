'use client'

import React from 'react'
import { Card } from "@/components/ui/card"

const RiskAlerts: React.FC = () => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Risk Alerts</h2>
      <div className="space-y-2">
        {/* Risk alerts content will go here */}
        <p>No active risk alerts</p>
      </div>
    </Card>
  )
}

export default RiskAlerts 