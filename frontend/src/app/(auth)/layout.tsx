import React from "react"

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md p-6 rounded-md shadow-lg bg-card border border-border">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
