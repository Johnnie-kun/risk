import React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-12 h-12">
        <div
          className="absolute w-full h-full rounded-full bg-blue-500 opacity-60 animate-bounce"
          style={{ animationDelay: "-0.5s" }}
        ></div>
        <div
          className="absolute w-full h-full rounded-full bg-blue-500 opacity-60 animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
