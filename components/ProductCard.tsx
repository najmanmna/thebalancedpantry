// src/components/ProductCard.tsx
"use client";

import React, { useState } from "react";
import PriceView from "./PriceView";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

const ProductCard = ({ product }: { product: any }) => {
  // 1. Image Logic (Top Level)
  const images = product?.images ?? [];
  const primaryImage = images[0];
  const secondaryImage = images[1];

  // 2. Stock Logic (Calculated in GROQ)
  const stock = product?.availableStock ?? 0;
  const isOutOfStock = stock <= 0;

  // 3. Status & Discount Logic
  const status = product?.status; // "new" | "hot" | "best"
  const discount = product?.discount ?? 0;
  const hasDiscount = discount > 0;

  // 4. State
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white border rounded-lg group overflow-hidden text-sm relative transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        
        {/* --- BADGES --- */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              SOLD OUT
            </span>
          )}

          {/* Status Badges */}
          {!isOutOfStock && status === "new" && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              NEW ARRIVAL
            </span>
          )}
          {!isOutOfStock && status === "hot" && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              HOT SELLING
            </span>
          )}
           {!isOutOfStock && status === "best" && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
              BEST DEAL
            </span>
          )}
        </div>

        {/* Discount Badge (Right Side) */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded z-10">
            -{discount}%
          </span>
        )}

        {/* --- IMAGE --- */}
        <Link href={`/product/${product?.slug?.current || ""}`} className="block w-full h-full">
          {primaryImage ? (
            <Image
              src={
                hovered && secondaryImage
                  ? urlFor(secondaryImage).width(500).height(500).url()
                  : urlFor(primaryImage).width(500).height(500).url()
              }
              alt={product?.name || "Product Image"}
              width={500}
              height={500}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                isOutOfStock ? "opacity-50 grayscale" : "group-hover:scale-105"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
              No Image
            </div>
          )}
        </Link>
      </div>

      {/* --- DETAILS --- */}
      <div className="p-4 flex flex-col gap-2">
        <Link 
          href={`/product/${product?.slug?.current || ""}`}
          className="hover:text-black transition-colors"
        >
          <h3 className="text-gray-800 font-medium line-clamp-1" title={product?.name}>
            {product?.name}
          </h3>
        </Link>

        {/* Categories (Optional) */}
        {product?.categories && product.categories.length > 0 && (
          <p className="text-xs text-gray-500 truncate">
            {Array.isArray(product.categories) ? product.categories.join(", ") : product.categories}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <PriceView
            price={product?.price}
            discount={product?.discount}
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;