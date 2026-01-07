// components/FloatingPromoPane.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/sanity/lib/client";

interface FeaturedPromo {
  code: string;
  discountPercentage: number;
  isFreeShipping: boolean; // 👈 1. ADD THIS
}

// 👈 2. UPDATE QUERY TO FETCH FLAG
const FEATURED_PROMO_QUERY = `
  *[_type == "promoCode" && isActive == true && isFeatured == true][0]{
    code,
    discountPercentage,
    isFreeShipping
  }
`;

export default function FloatingPromoPane() {
  const [promo, setPromo] = useState<FeaturedPromo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedPromo() {
      try {
        const data = await client.fetch<FeaturedPromo | null>(
          FEATURED_PROMO_QUERY
        );
        setPromo(data);
      } catch (err) {
        console.error("Failed to fetch featured promo:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeaturedPromo();
  }, []);

  if (isLoading || !promo) {
    return null;
  }

  // 👈 3. DETERMINE THE LABEL LOGIC
  const mainLabel = promo.isFreeShipping
    ? "FREE SHIPPING"
    : `${promo.discountPercentage}% OFF`;

  const shopLink = "/category/all"; 

  return (
    <>
      {/* --- Desktop View (Vertical Pane) --- */}
      <Link
        href={shopLink}
        className="
          hidden md:flex
          fixed left-0 top-1/2 z-40
          -translate-y-1/2
          transform
          
          cursor-pointer 
          flex-col items-center 
          rounded-r-lg 
          bg-black px-3 py-6 
          text-white 
          shadow-lg 
          transition-transform 
          hover:-translate-y-1/2 hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        "
      >
        <span
          style={{ writingMode: "vertical-rl" }}
          className="rotate-180 font-bold tracking-widest text-sm uppercase whitespace-nowrap"
        >
          {mainLabel}
        </span>
        <span className="my-3 h-8 w-px bg-gray-600" />
        <span
          style={{ writingMode: "vertical-rl" }}
          className="rotate-180 font-mono text-xs tracking-widest"
        >
          CODE: {promo.code}
        </span>
      </Link>

      {/* --- Mobile View (Bottom Banner) --- */}
      <Link
        href={shopLink}
        className="
          flex md:hidden
          fixed bottom-0 left-0 right-0 z-40
          
          cursor-pointer
          items-center
          justify-between
          bg-black px-4 py-3
          text-white
          shadow-lg
          focus:outline-none focus:ring-2 focus:ring-black
        "
      >
        <span className="font-bold tracking-wide text-sm uppercase">
          {mainLabel}
        </span>
        <div className="flex flex-col items-end">
             <span className="text-[10px] text-gray-400 uppercase tracking-wider">Use Code</span>
             <span className="font-mono text-xs font-bold tracking-widest text-yellow-400">
               {promo.code}
             </span>
        </div>
      </Link>
    </>
  );
}