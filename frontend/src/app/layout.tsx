import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryConfig";

// Default metadata for SEO
export const metadata: Metadata = {
  title: "Bitcoin Predictor App",
  description: "Predict Bitcoin prices with real-time data and advanced analytics.",
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#ffffff",
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
      <body className="antialiased bg-gray-100 text-gray-900">
        {/* QueryClientProvider enables React Query throughout the app */}
        <QueryClientProvider client={queryClient}>
          {/* Error Boundary can be wrapped here for fallback UI */}
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}