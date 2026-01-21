import "./globals.css";

import React from "react";
import type { Metadata } from "next";
import { Fraunces, Quicksand } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "react-hot-toast";

// 1. SETUP FONTS
// Note: We don't need to configure axes unless you have a specific visual need.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// 2. METADATA OPTIMIZATION
export const metadata: Metadata = {
  // ✅ Fix: Set metadataBase to your production URL to fix OG Image issues
  metadataBase: new URL("https://thebalancedpantry.lk"),
  
  title: {
    template: "%s | The Balanced Pantry",
    default: "The Balanced Pantry | Premium Freeze-Dried Snacks",
  },
  description:
    "Experience the crunch of 100% real fruit. Flash-frozen to lock in nutrients. No sugar added. Imported quality, delivered islandwide in Sri Lanka.",
  icons: {
    icon: "/icon.png", 
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "The Balanced Pantry | Crunchy Real Fruit Snacks",
    description:
      "100% Natural, 0% Guilt. Taste the crunch of freeze-dried strawberries imported from the finest farms.",
    url: "https://thebalancedpantry.lk",
    siteName: "The Balanced Pantry",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Balanced Pantry - Freeze Dried Strawberries",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={`${fraunces.variable} ${quicksand.variable}`}>
      <body className="antialiased bg-cream text-charcoal selection:bg-brandRed/30">
        
        {children}

        {/* CUSTOM RETRO TOASTER */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#4A3728", // Charcoal
              color: "#F3EFE0",      // Cream
              fontFamily: "var(--font-sans)",
              border: "1px solid #5D7052", // Sage Green
            },
            success: {
              iconTheme: {
                primary: "#5D7052",
                secondary: "#F3EFE0",
              },
            },
            error: {
              iconTheme: {
                primary: "#D64545",
                secondary: "#F3EFE0",
              },
            },
          }}
        />

        {/* Sanity Live Content */}
        <SanityLive />
        
      </body>
    </html>
  );
};

export default RootLayout;