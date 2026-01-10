import React from "react";
import type { Metadata } from "next";
import { Fraunces, Quicksand } from "next/font/google"; // Updated Fonts
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

// 1. SETUP RETRO SERIF FONT (Headings)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  // axes: ["SOFT", "WONK"], // Optional: Adds extra retro character
});

// 2. SETUP SOFT SANS FONT (Body)
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | The Balanced Pantry",
    default: "The Balanced Pantry | Premium Freeze-Dried Snacks",
  },
  description:
    "Experience the crunch of 100% real fruit. Flash-frozen to lock in nutrients. No sugar added. Imported quality, delivered islandwide in Sri Lanka.",
  icons: {
    icon: "/favicon.png", // Make sure to update this image file later
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "The Balanced Pantry | Crunchy Real Fruit Snacks",
    description:
      "100% Natural, 0% Guilt. Taste the crunch of freeze-dried strawberries imported from the finest farms.",
    url: "https://thebalancedpantry.lk",
    siteName: "The Balanced Pantry",
    images: [
      {
        url: "/og-image.jpg", // Update this with a shot of the strawberry bowl
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
      <body
        // 3. GLOBAL THEME APPLICATION
        // bg-cream: Sets the vintage paper background
        // text-charcoal: Sets the dark brown text default
        // antialiased: Makes fonts crisp
        className="antialiased bg-cream text-charcoal selection:bg-brandRed/30"
      >
        
        {children}

        {/* 4. CUSTOM RETRO TOASTER */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#4A3728", // Charcoal/Brown background
              color: "#F3EFE0",      // Cream text
              fontFamily: "var(--font-sans)",
              border: "1px solid #5D7052", // Subtle Sage Green border
            },
            success: {
              iconTheme: {
                primary: "#5D7052", // Sage Green checkmark
                secondary: "#F3EFE0",
              },
            },
            error: {
              iconTheme: {
                primary: "#D64545", // Brand Red X
                secondary: "#F3EFE0",
              },
            },
          }}
        />

        {/* Sanity Live Content */}
        <SanityLive />
        
        {/* Floating WhatsApp Button */}
        {/* <WhatsAppButton /> */}
      </body>
    </html>
  );
};

export default RootLayout;