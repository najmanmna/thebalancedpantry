"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Minus, ChevronDown, Check, Leaf } from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { urlFor } from "@/sanity/lib/image";

// Helper to handle cases where product might be loading or missing
const defaultBundle = { title: "Single Pack", count: 1, price: 0, tag: "Standard" };

export default function ProductShowcase({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);

  // --- 1. INITIALIZE STATE ---
  // Try to default to the 2nd option (usually the "Most Popular" 3-pack), otherwise 1st
  const [selectedBundle, setSelectedBundle] = useState(
    product?.bundleOptions?.[1] || product?.bundleOptions?.[0] || defaultBundle
  );

  const [qty, setQty] = useState(1);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);

  // --- 2. STOCK LOGIC ---
  const openingStock = product?.openingStock ?? 0;
  const stockOut = product?.stockOut ?? 0;
  const availableStock = openingStock - stockOut;
  const isOutOfStock = availableStock <= 0;

  // Calculate Max Packs allowed based on Stock & Bundle Size
  const maxQty = selectedBundle.count > 0 
    ? Math.floor(availableStock / selectedBundle.count) 
    : 0;

  // Reset qty when bundle changes
  useEffect(() => {
    setQty(1);
  }, [selectedBundle]);

  // --- 3. CART ACTIONS ---
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem(product, qty, selectedBundle);
    
    // Toast notification is handled in the store, but we can add a visual cue here if needed
  };

  // If data isn't loaded yet, return null or a skeleton
  if (!product) return null;

  return (
    <section id="shop" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT: PRODUCT IMAGE --- */}
        <div className="relative bg-[#F3EFE0] rounded-[3rem] p-12 flex items-center justify-center min-h-[400px] sm:min-h-[500px] border border-charcoal/5 group">
          
          {/* Background Decor */}
          <div className="absolute inset-0 border-[3px] border-charcoal/5 rounded-[2.5rem] m-4 pointer-events-none"></div>
          
          {/* POUCH MOCKUP */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[350px] sm:h-[450px] drop-shadow-2xl"
          >
            {product.mainImage && (
              <Image 
                src={urlFor(product.mainImage).url()} 
                alt={product.name}
                fill 
                className="object-contain"
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

        {/* --- RIGHT: THE OFFER --- */}
        <div>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-brandRed">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-xs font-bold font-sans text-charcoal/60 tracking-wider uppercase">48 Reviews</span>
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
                {isOutOfStock && <span className="text-red-500 font-bold text-sm">Out of Stock</span>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {product.bundleOptions?.map((bundle: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedBundle(bundle)}
                  disabled={isOutOfStock}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedBundle.title === bundle.title
                      ? "border-brandRed bg-brandRed/5 shadow-[4px_4px_0px_0px_#D64545]"
                      : "border-charcoal/10 bg-white hover:border-charcoal/30"
                  } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {bundle.savings && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {bundle.savings}
                    </span>
                  )}
                  <div className="font-serif font-bold text-charcoal text-lg">{bundle.count} Pack</div>
                  <div className="font-sans text-sm text-charcoal/60">Rs. {bundle.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-charcoal/10">
            
            {/* Quantity Counter */}
            <div className="flex items-center gap-4 bg-[#F3EFE0] px-4 py-3 rounded-full border border-charcoal/10">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))} 
                disabled={isOutOfStock || qty <= 1}
                className="p-1 hover:bg-black/5 rounded-full disabled:opacity-30"
              >
                <Minus className="w-4 h-4 text-charcoal" />
              </button>
              <span className="font-serif font-bold text-xl text-charcoal w-6 text-center">{qty}</span>
              <button 
                onClick={() => {
                   if (qty < maxQty) setQty(q => q + 1);
                   else toast.error(`Only ${maxQty} packs available!`);
                }} 
                disabled={isOutOfStock || qty >= maxQty}
                className="p-1 hover:bg-black/5 rounded-full disabled:opacity-30"
              >
                <Plus className="w-4 h-4 text-charcoal" />
              </button>
            </div>

            {/* Add To Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 font-serif font-bold text-xl px-8 py-4 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-3 w-full sm:w-auto
                ${isOutOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none" : "bg-brandRed text-cream"}
              `}
            >
              <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
              {!isOutOfStock && (
                <span className="bg-black/20 px-2 py-0.5 rounded text-base">
                    Rs. {(selectedBundle.price * qty).toLocaleString()}
                </span>
              )}
            </button>
          </div>

          {/* Accordion: Nutrition Info */}
          {product.nutrition && (
            <div className="border border-charcoal/10 rounded-2xl overflow-hidden">
                <button 
                onClick={() => setIsNutritionOpen(!isNutritionOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#F9F7F2] hover:bg-[#F3EFE0] transition-colors"
                >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-charcoal/60" />
                    </div>
                    <span className="font-serif font-bold text-charcoal">Nutrition Facts</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-charcoal transition-transform ${isNutritionOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                {isNutritionOpen && (
                    <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                    >
                    <div className="p-6 bg-white text-sm font-sans text-charcoal/80 space-y-2">
                        <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                            <span>Serving Size</span>
                            <span className="font-bold">{product.nutrition.servingSize}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                            <span>Calories</span>
                            <span className="font-bold">{product.nutrition.calories}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                            <span>Sugars (Natural)</span>
                            <span className="font-bold">{product.nutrition.sugar}</span>
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
          )}

        </div>
      </div>
    </section>
  );
}