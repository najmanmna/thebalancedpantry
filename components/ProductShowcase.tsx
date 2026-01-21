"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Minus, ChevronDown, Leaf, Check, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { urlFor } from "@/sanity/lib/image";

// --- Types ---
interface Bundle {
  title: string;
  count: number;
  price: number;
  savings?: string;
}

interface Nutrition {
  servingSize: string;
  calories: string;
  sugar: string;
}

interface Product {
  name: string;
  description: string;
  badge?: string;
  mainImage: any;
  bundleOptions?: Bundle[];
  openingStock?: number;
  stockOut?: number;
  nutrition?: Nutrition;
}

// Default fallback
const DEFAULT_BUNDLE: Bundle = { title: "Single Pack", count: 1, price: 0 };

export default function ProductShowcase({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  
  // --- State ---
  // Default to 2nd option (popular) if available, else 1st
  const [selectedBundle, setSelectedBundle] = useState<Bundle>(
    product?.bundleOptions?.[1] || product?.bundleOptions?.[0] || DEFAULT_BUNDLE
  );
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false); // Local UI state for button feedback

  // --- Derived State (Stock) ---
  const { isOutOfStock, maxQty } = useMemo(() => {
    const opening = product?.openingStock ?? 0;
    const out = product?.stockOut ?? 0;
    const available = Math.max(0, opening - out);
    
    return {
      isOutOfStock: available <= 0,
      // Prevent division by zero if bundle.count is missing
      maxQty: selectedBundle.count > 0 ? Math.floor(available / selectedBundle.count) : 0
    };
  }, [product, selectedBundle]);

  // Reset qty when bundle changes
  useEffect(() => {
    setQty(1);
  }, [selectedBundle]);

  // --- Handlers ---
  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;

    addItem(product, qty, selectedBundle);
    
    // Trigger visual feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }, [addItem, isOutOfStock, product, qty, selectedBundle]);

  if (!product) return null;

  return (
    <section id="shop" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT: PRODUCT IMAGE (Memoized) --- */}
        <ProductImageWrapper product={product} />

        {/* --- RIGHT: THE OFFER --- */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-brandRed">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-xs font-bold font-sans text-charcoal/60 tracking-wider uppercase">
                Best Seller
              </span>
            </div>
            <h2 className="font-serif text-5xl font-black text-charcoal mb-2 leading-none">
              {product.name}
            </h2>
            <p className="font-sans text-charcoal/70 text-lg leading-relaxed mt-4">
              {product.description}
            </p>
          </div>

          {/* Bundle Selector */}
          <div className="mb-10">
            <div className="flex justify-between items-baseline mb-4">
               <label className="block font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40">
                 Select Quantity
               </label>
               {isOutOfStock && <span className="text-red-500 font-bold text-sm animate-pulse">Out of Stock</span>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {product.bundleOptions?.map((bundle, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedBundle(bundle)}
                  disabled={isOutOfStock}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                    selectedBundle.title === bundle.title
                      ? "border-brandRed bg-brandRed/5 shadow-[4px_4px_0px_0px_#D64545]"
                      : "border-charcoal/10 bg-white hover:border-charcoal/30"
                  } ${isOutOfStock ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                >
                  {bundle.savings && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                      {bundle.savings}
                    </span>
                  )}
                  <div className="font-serif font-bold text-charcoal text-lg">{bundle.count} Pack</div>
                  <div className="font-sans text-sm text-charcoal/60 group-hover:text-charcoal transition-colors">
                    Rs. {bundle.price.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-10 pb-10 border-b border-charcoal/10">
            
            {/* Quantity Counter */}
            <div className="flex items-center justify-between sm:justify-start gap-4 bg-[#F3EFE0] px-4 py-3 rounded-full border border-charcoal/10">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))} 
                disabled={isOutOfStock || qty <= 1}
                className="p-1 hover:bg-black/5 rounded-full disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-charcoal" />
              </button>
              <span className="font-serif font-bold text-xl text-charcoal w-6 text-center tabular-nums">{qty}</span>
              <button 
                onClick={() => {
                   if (qty < maxQty) setQty(q => q + 1);
                   else toast.error(`Max stock reached!`);
                }} 
                disabled={isOutOfStock || qty >= maxQty}
                className="p-1 hover:bg-black/5 rounded-full disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-charcoal" />
              </button>
            </div>

            {/* Add To Cart Button (With Success State) */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdded}
              className={`flex-1 font-serif font-bold text-xl px-8 py-4 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-3 w-full sm:w-auto relative overflow-hidden
                ${isOutOfStock 
                   ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none" 
                   : isAdded 
                     ? "bg-green-600 text-white border-green-800 shadow-[2px_2px_0px_0px_#14532d]" 
                     : "bg-brandRed text-cream hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4A3728]"
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div 
                    key="success"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    <span>Added!</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="default"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2 w-full justify-center"
                  >
                    <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
                    {!isOutOfStock && (
                      <span className="bg-black/20 px-2 py-0.5 rounded text-base font-medium">
                          Rs. {(selectedBundle.price * qty).toLocaleString()}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Nutrition Info (Memoized) */}
          <NutritionAccordion nutrition={product.nutrition} />

        </div>
      </div>
    </section>
  );
}

// --- Sub-Components (Prevent Re-renders) ---

const ProductImageWrapper = React.memo(function ProductImageWrapper({ product }: { product: Product }) {
  // Optimization: Request specific dimensions (800x800) and WebP format
  const imageUrl = product.mainImage 
    ? urlFor(product.mainImage).width(800).height(800).fit('crop').auto('format').url() 
    : null;

  return (
    <div className="relative bg-[#F3EFE0] rounded-[3rem] p-8 sm:p-12 flex items-center justify-center min-h-[400px] sm:min-h-[500px] border border-charcoal/5 group">
      {/* Background Decor */}
      <div className="absolute inset-0 border-[3px] border-charcoal/5 rounded-[2.5rem] m-4 pointer-events-none"></div>
      
      {/* POUCH MOCKUP */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[350px] sm:h-[450px] drop-shadow-2xl"
      >
        {imageUrl && (
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill 
            // Optimization: Load smaller images on mobile
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority // Load ASAP as this is the main product image
          />
        )}
      </motion.div>

      {/* "Natural" Badge */}
      {product.badge && (
        <div className="absolute top-8 left-8 bg-charcoal text-cream font-serif font-bold px-4 py-2 rounded-full text-sm z-10">
          {product.badge}
        </div>
      )}
    </div>
  );
});

const NutritionAccordion = React.memo(function NutritionAccordion({ nutrition }: { nutrition?: Nutrition }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!nutrition) return null;

  return (
    <div className="border border-charcoal/10 rounded-2xl overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-[#F9F7F2] hover:bg-[#F3EFE0] transition-colors"
        >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-charcoal/60" />
            </div>
            <span className="font-serif font-bold text-charcoal">Nutrition Facts</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-charcoal transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
        {isOpen && (
            <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            >
            <div className="p-6 bg-white text-sm font-sans text-charcoal/80 space-y-2 border-t border-charcoal/5">
                <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                    <span>Serving Size</span>
                    <span className="font-bold">{nutrition.servingSize}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                    <span>Calories</span>
                    <span className="font-bold">{nutrition.calories}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                    <span>Sugars (Natural)</span>
                    <span className="font-bold">{nutrition.sugar}</span>
                </div>
                <div className="flex justify-between">
                    <span>Added Sugar</span>
                    <span className="font-bold text-brandRed">&lt; 1g (3%)</span>
                </div>
            </div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
});