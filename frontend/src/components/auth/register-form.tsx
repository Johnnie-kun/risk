'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, AlertTriangle } from 'lucide-react'

export default function RegisterForm() {
  return (
    <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a1b1e] border-gray-800">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0066FF] rounded flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-[#0066FF] font-bold text-2xl">RISK</span>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400" aria-label="Scan QR Code">
              <QrCode className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">Register</h1>

          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="emailOrPhone" className="text-sm text-gray-200">
                Email/Phone number
              </label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Email/Phone (without country code)"
                className="bg-[#2b2f36] border-gray-700 text-white placeholder:text-gray-500"
                required
                aria-label="Email or Phone"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-200">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="bg-[#2b2f36] border-gray-700 text-white placeholder:text-gray-500"
                required
                aria-label="Password"
              />
            </div>

            <Button className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold h-12">
              Register
            </Button>

            <div className="text-center mt-4">
              <a href="#" className="text-[#0066FF] hover:text-[#0052CC] text-sm">
                Already have an account? Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}