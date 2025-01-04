"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, children, ...props }, ref) => {
    // Close modal when pressing the Escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose()
        }
      }

      if (isOpen) {
        window.addEventListener("keydown", handleEscape)
      }

      return () => {
        window.removeEventListener("keydown", handleEscape)
      }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30",
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className="bg-white rounded-lg p-6 relative max-w-md w-full shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close modal"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = "Modal"

export { Modal }