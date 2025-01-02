'use client'

import React from "react"
import Link from "next/link"

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-white text-2xl font-semibold">My Website</h1>
        <ul className="flex space-x-4">
          <li>
            <Link
              href="/"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Go to Home page"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Go to About page"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Go to Contact page"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
