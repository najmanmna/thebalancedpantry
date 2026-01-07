import React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";
// import Script from "next/script"; // <-- For Method 1

import "./globals.css";

// Import Google Font (Poppins) with multiple weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// const GA_MEASUREMENT_ID = "G-QLGJ5THRC9";

export const metadata: Metadata = {
  title: {
    template: "%s - Elvyn",
    default: "Elvyn | Bags & Accessories",
  },
  description:
    "Discover premium bags and accessories at Elvyn. Carry your story in style with timeless designs crafted for elegance and everyday comfort. Visit elvynstore.com.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Elvyn | Bags & Accessories",
    description:
      "Explore Elvyn’s collection of stylish bags and accessories — Carry Your Story in Style.",
    url: "https://elvynstore.com",
    siteName: "Elvyn",
    images: [
      {
        url: "/2.jpg", // replace with your actual OG image if available
        width: 1200,
        height: 630,
        alt: "Elvyn Bags & Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} pt-25 antialiased bg-tech_bg_color`}
      >
 
        {children}

        {/* Toaster */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#000000", color: "#fff" },
          }}
        />

        {/* Sanity Live */}
        <SanityLive />
       
        {/* Floating WhatsApp Button */}
        <WhatsAppButton />
      </body>
     {/* <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script> */}
    </html>
  );
};

export default RootLayout;
