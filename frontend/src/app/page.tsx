"use client";

import { Button } from "@/components/ui/button";
import { Moon, Globe, Search } from "lucide-react";
import HeroImage from "@/components/hero";
import Link from "next/link";

// Separate component for the extreme neon effect
const ExtremeNeonEffect = () => {
  return (
    <>
      {/* Static neon background with extreme brightness */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-black to-purple-900 opacity-80"></div>
        
        {/* Extremely bright neon spots */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500 blur-[150px] opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500 blur-[150px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500 blur-[150px] opacity-60"></div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-500 blur-[150px] opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-cyan-500 blur-[150px] opacity-70"></div>
      </div>
      
      {/* Additional light beams */}
      <div className="fixed inset-0 -z-5 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[1500px] bg-blue-400 rotate-45 blur-[80px] opacity-40"></div>
        <div className="absolute top-3/4 right-1/4 w-[300px] h-[1500px] bg-purple-400 -rotate-45 blur-[80px] opacity-40"></div>
      </div>
    </>
  );
};

const Navbar = () => (
  <header className="flex justify-between items-center p-6 relative z-20">
    <h1 className="text-blue-400 text-3xl font-bold">RISK</h1>
    <div className="flex items-center gap-4">
      <Search className="text-white" aria-label="Search" />
      <Button variant="ghost" className="text-white hover:text-blue-300 hover:bg-blue-900/30 transition-all">
        Log In
      </Button>
      <Button variant="default" className="bg-blue-600 text-white hover:bg-blue-500">
        Sign Up
      </Button>
      <Globe className="text-white" aria-label="Language" />
      <Moon className="text-white" aria-label="Theme" />
    </div>
  </header>
);

const HeroSection = () => (
  <main className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-8 md:py-16 gap-16 relative z-10">
    <div className="max-w-lg text-center md:text-left">
      <h2 className="text-white text-4xl md:text-6xl font-serif mb-8">
        Welcome to <br /> The Risk Homepage
      </h2>
      <Link href="/dashboard">
        <Button
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 text-white text-xl px-8 py-5 transition-all duration-300 rounded-xl"
        >
          Go to Dashboard
        </Button>
      </Link>
    </div>
    <div className="relative z-10 md:w-1/2">
      <HeroImage className="transform hover:scale-105 transition-transform duration-300" />
    </div>
  </main>
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ExtremeNeonEffect />
      <Navbar />
      <HeroSection />
    </div>
  );
}