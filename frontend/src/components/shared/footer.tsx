import React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-center py-4 mt-8">
      <p className="text-white text-sm">
        © 2023 Your Company. All rights reserved.
      </p>
      <p className="text-gray-400 text-xs mt-2">
        <a
          href="#"
          className="hover:text-gray-300 transition-colors"
          aria-label="Privacy Policy"
        >
          Privacy Policy
        </a>{" "}
        |{" "}
        <a
          href="#"
          className="hover:text-gray-300 transition-colors"
          aria-label="Terms of Service"
        >
          Terms of Service
        </a>
      </p>
    </footer>
  )
}

export default Footer
