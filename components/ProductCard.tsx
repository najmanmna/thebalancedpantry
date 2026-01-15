"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";

// Background colors cycle for variety (matching your PantryGrid logic)
const BG_COLORS = [
  "bg-[#FFF3E0]", // Light Orange
  "bg-[#F3E5F5]", // Light Purple
  "bg-[#E0F2F1]", // Light Teal
  "bg-[#F9F7F2]", // Light Cream
];

const ProductCard = ({ product }: { product: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. Image Logic (Handle Single vs Array)
  // New schema uses 'mainImage', older simplified used 'images[]'
  // We prioritize mainImage, then fallback to images[0]
  const imageRef = product.mainImage || product.images?.[0];

  // 2. Stock Logic
  const openingStock = product?.openingStock ?? 0;
  const stockOut = product?.stockOut ?? 0;
  const availableStock = openingStock - stockOut;
  const isOutOfStock = availableStock <= 0;

  // 3. Random Pastel Background (Deterministic based on ID string length)
  const bgIndex = (product._id?.length || 0) % BG_COLORS.length;
  const bgColor = BG_COLORS[bgIndex];

  return (
    <Link 
      href={`/product/${product?.slug?.current || product?.slug || ""}`}
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className={`relative w-full aspect-[4/5] ${bgColor} rounded-[2rem] mb-4 overflow-hidden border border-charcoal/5 transition-all duration-300 group-hover:shadow-md`}>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
           {isOutOfStock ? (
             <span className="bg-charcoal text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
               Sold Out
             </span>
           ) : product.badge ? (
             <span className="bg-white/90 text-charcoal text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-charcoal/5 backdrop-blur-sm">
               {product.badge}
             </span>
           ) : null}
        </div>

        {/* Product Image */}
        <div className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-110 transition-transform duration-500 ease-in-out">
           {imageRef ? (
             <Image
               src={urlFor(imageRef).url()}
               alt={product?.name || "Product Image"}
               width={500}
               height={500}
               className={`object-contain drop-shadow-lg transition-all duration-500 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
             />
           ) : (
             <div className="text-charcoal/20 font-serif italic">No Image</div>
           )}
        </div>

        {/* Floating Action Button (Appears on Hover) */}
        <div className={`absolute bottom-4 right-4 transition-all duration-300 transform ${isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
           <div className="w-10 h-10 bg-brandRed text-cream rounded-full flex items-center justify-center shadow-lg">
              <ArrowUpRight className="w-5 h-5" />
           </div>
        </div>
      </div>

      {/* --- DETAILS --- */}
      <div className="pl-1">
        <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight mb-1 group-hover:text-brandRed transition-colors">
          {product?.name}
        </h3>
        
        {/* Optional Subtitle */}
        {product.subtitle && (
          <p className="font-sans text-xs text-charcoal/40 uppercase tracking-wider mb-1 line-clamp-1">
            {product.subtitle}
          </p>
        )}

        <PriceFormatter 
          amount={product?.price} 
          className="font-sans text-charcoal/60 font-medium" 
        />
      </div>
    </Link>
  );
};

export default ProductCard;