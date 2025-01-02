import React from "react"
import Link from "next/link"

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-6 justify-center">
        <li>
          <Link href="/" aria-label="Go to Home page">
            <span className="text-white text-lg hover:text-blue-400 transition-colors">Home</span>
          </Link>
        </li>
        <li>
          <a
            href="/about"
            className="text-white text-lg hover:text-blue-400 transition-colors"
            aria-label="Go to About page"
          >
            About
          </a>
        </li>
        <li>
          <a
            href="/contact"
            className="text-white text-lg hover:text-blue-400 transition-colors"
            aria-label="Go to Contact page"
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar