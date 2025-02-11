'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to login. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

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
            <Button variant="ghost" size="sm" className="text-gray-400">
              <QrCode className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#2b2f36] border-gray-700 text-white placeholder:text-gray-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#2b2f36] border-gray-700 text-white placeholder:text-gray-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1b1e] text-gray-400">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-[#2b2f36] border-gray-700 text-white hover:bg-[#2b2f36]/80"
              onClick={() => {/* Implement Google login */}}
            >
              <img src="/google.svg" alt="" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-[#2b2f36] border-gray-700 text-white hover:bg-[#2b2f36]/80"
              onClick={() => {/* Implement Apple login */}}
            >
              <img src="/apple.svg" alt="" className="w-5 h-5 mr-2" />
              Continue with Apple
            </Button>

            <div className="text-center">
              <a href="/register" className="text-[#0066FF] hover:text-[#0052CC] text-sm">
                Create a RISK Account
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}