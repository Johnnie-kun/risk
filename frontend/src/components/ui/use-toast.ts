import * as React from "react"
import { createRoot } from "react-dom/client"
import { Toast } from "./toast"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast(props: ToastProps) {
  const toastElement = React.createElement(Toast, {
    ...props,
    className: `${props.variant === "destructive" ? "bg-red-600" : "bg-gray-800"} text-white`,
  })
  
  // Create container and root
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  
  // Render the toast element
  root.render(toastElement)
  
  // Remove the toast after 3 seconds
  setTimeout(() => {
    root.unmount()
    document.body.removeChild(container)
  }, 3000)
}