import type { Metadata, Viewport } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

// Theme color configuration
export const themeColor = "#ffffff";

// Default metadata for SEO
export const metadata: Metadata = {
  title: "Bitcoin Predictor App",
  description: "Predict Bitcoin prices with real-time data and advanced analytics.",
  openGraph: {
    title: "Bitcoin Predictor App",
    description: "Predict Bitcoin prices with real-time data and advanced analytics.",
    type: "website",
    url: "https://bitcoin-predictor-app.com",
    images: [
      {
        url: "https://bitcoin-predictor-app.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bitcoin Predictor App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Predictor App",
    description: "Predict Bitcoin prices with real-time data and advanced analytics.",
    images: ["https://bitcoin-predictor-app.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-gray-900 text-gray-100">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}