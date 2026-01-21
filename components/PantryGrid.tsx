import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";

// --- Types ---
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mainImage: any;
  badge?: string;
  openingStock?: number;
  stockOut?: number;
}

// --- Constants ---
const BG_COLORS = [
  "bg-[#FFF3E0]", // Light Orange
  "bg-[#F3E5F5]", // Light Purple
  "bg-[#E0F2F1]", // Light Teal
  "bg-[#F9F7F2]", // Light Cream
];

// 1. OPTIMIZED QUERY: Limits to 6 items to prevent massive payloads
const productsQuery = groq`*[_type == "product"] | order(_createdAt desc)[0...5] {
  _id,
  name,
  "slug": slug.current,
  price,
  mainImage,
  badge,
  openingStock,
  stockOut
}`;

export default async function PantryGrid() {
  // 2. CACHING: Revalidate every hour (ISR)
  const products = await client.fetch<Product[]>(productsQuery, {}, { next: { revalidate: 3600 } });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 border-b border-charcoal/10 pb-6 gap-4">
          <div>
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
              The Collection
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-charcoal mt-2">
              Stock Your <span className="italic font-light">Pantry.</span>
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="hidden sm:flex items-center gap-2 font-sans font-bold text-charcoal hover:text-brandRed transition-colors"
            aria-label="View all products"
          >
            View All Products <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
        
        {/* Mobile View All */}
        <div className="mt-12 text-center sm:hidden">
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 font-sans font-bold text-charcoal hover:text-brandRed transition-colors border-b border-charcoal pb-1"
            >
                View All Products <ArrowUpRight className="w-4 h-4" />
            </Link>
        </div>

      </div>
    </section>
  );
}

// --- Sub-Component ---

function ProductCard({ product, index }: { product: Product, index: number }) {
  const bgColor = BG_COLORS[index % BG_COLORS.length];
  
  const availableStock = (product.openingStock || 0) - (product.stockOut || 0);
  const isOutOfStock = availableStock <= 0;

  // 3. OPTIMIZED IMAGE URL: Request exact size (400x500) & WebP
  const imageUrl = product.mainImage 
    ? urlFor(product.mainImage).width(400).height(500).fit('crop').auto('format').url() 
    : null;

  return (
    <div className="group block">
      <Link href={`/product/${product.slug}`}>
        
        {/* Image Container */}
        <div className={`relative w-full aspect-[4/5] ${bgColor} rounded-[2rem] mb-6 overflow-hidden border border-charcoal/5`}>
          
          {/* Badge */}
          {(product.badge || isOutOfStock) && (
            <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full border border-charcoal/5 backdrop-blur-sm ${isOutOfStock ? "bg-charcoal text-white" : "bg-white/90 text-charcoal"}`}>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider">
                {isOutOfStock ? "Sold Out" : product.badge}
              </span>
            </div>
          )}

          {/* Product Image */}
          <div className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-500 ease-in-out">
            {imageUrl && (
              <Image 
                src={imageUrl} 
                alt={product.name} 
                fill
                // 4. SIZES PROP: Critical for LCP
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-contain drop-shadow-lg ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
              />
            )}
          </div>

          {/* Hover Button */}
          <div className="absolute bottom-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
             <div className="w-10 h-10 bg-brandRed rounded-full flex items-center justify-center text-cream shadow-md">
                <ArrowUpRight className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="font-serif text-2xl font-bold text-charcoal leading-none mb-2 group-hover:text-brandRed transition-colors">
            {product.name}
          </h3>
          <p className="font-sans text-charcoal/60 font-medium">
            Rs. {product.price.toLocaleString()}
          </p>
        </div>
      </Link>
    </div>
  );
}