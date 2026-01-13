"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Minus, ChevronDown, ShoppingBag } from "lucide-react";

import strawberrypacket from "@/images/strawberrypacket.png"; 

const bundles = [
  { id: 1, name: "The Taster", count: 1, price: 1200, save: 0, label: "Just a try" },
  { id: 2, name: "The Pantry Stash", count: 3, price: 3400, save: 200, label: "Most Popular" },
  { id: 3, name: "The Family Pack", count: 6, price: 6500, save: 700, label: "Best Value" },
];

export default function ProductShowcase() {
  const [selectedBundle, setSelectedBundle] = useState(bundles[1]); // Default to 3-pack
  const [qty, setQty] = useState(1);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);

  return (
    <section id="shop" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT: PRODUCT IMAGE --- */}
        <div className="relative bg-[#F3EFE0] rounded-[3rem] p-12 flex items-center justify-center min-h-[500px] border border-charcoal/5 group">
          
          {/* Background Decor */}
          <div className="absolute inset-0 border-[3px] border-charcoal/5 rounded-[2.5rem] m-4 pointer-events-none"></div>
          
          {/* POUCH MOCKUP (Replace 'strawberrybowl' with your Pouch Image) */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[400px] drop-shadow-2xl"
          >
            {/* Ideally, put your Pouch PNG here. Using bowl as placeholder. */}
            <Image 
              src={strawberrypacket} 
              alt="Freeze Dried Strawberry Pouch"
              fill 
              className="object-contain"
            />
          </motion.div>

          {/* "Natural" Badge */}
          <div className="absolute top-8 left-8 bg-charcoal text-cream font-serif font-bold px-4 py-2 rounded-full text-sm">
            100% Natural
          </div>
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
            <h2 className="font-serif text-5xl font-black text-charcoal mb-2">
              Freeze Dried <span className="text-brandRed">Strawberries</span>
            </h2>
            <p className="font-sans text-charcoal/70 text-lg leading-relaxed">
              The crunchiest strawberries you'll ever eat. Sourced from premium farms, flash-frozen to keep 98% of nutrients. Sweet, tart, and completely addictive.
            </p>
          </div>

          {/* Bundle Selector */}
          <div className="mb-10">
            <label className="block font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-4">
              Select Quantity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bundles.map((bundle) => (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedBundle.id === bundle.id
                      ? "border-brandRed bg-brandRed/5 shadow-[4px_4px_0px_0px_#D64545]"
                      : "border-charcoal/10 bg-white hover:border-charcoal/30"
                  }`}
                >
                  {bundle.save > 0 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Save Rs. {bundle.save}
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
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-1 hover:bg-black/5 rounded-full">
                <Minus className="w-4 h-4 text-charcoal" />
              </button>
              <span className="font-serif font-bold text-xl text-charcoal w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="p-1 hover:bg-black/5 rounded-full">
                <Plus className="w-4 h-4 text-charcoal" />
              </button>
            </div>

            {/* Add To Cart Button */}
            <button className="flex-1 bg-brandRed text-cream font-serif font-bold text-xl px-8 py-4 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-3 w-full sm:w-auto">
              <span>Add to Cart</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-base">
                Rs. {(selectedBundle.price * qty).toLocaleString()}
              </span>
            </button>
          </div>

          {/* Accordion: Nutrition Info */}
          <div className="border border-charcoal/10 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setIsNutritionOpen(!isNutritionOpen)}
              className="w-full flex items-center justify-between p-4 bg-[#F9F7F2] hover:bg-[#F3EFE0] transition-colors"
            >
              <span className="font-serif font-bold text-charcoal">Nutrition Facts</span>
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
                      <span className="font-bold">50g</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                      <span>Calories</span>
                      <span className="font-bold">185 kcal</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                      <span>Total Fat</span>
                      <span className="font-bold">0g</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-charcoal/20 pb-2">
                      <span>Sugars (Natural)</span>
                      <span className="font-bold">24g</span>
                    </div>
                    
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}