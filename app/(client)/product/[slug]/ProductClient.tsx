"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ChevronDown, ShieldCheck, Leaf } from "lucide-react";
import useCartStore from "@/store";
import Loading from "@/components/Loading";
import { urlFor } from "@/sanity/lib/image";
import { toast } from "react-hot-toast";

interface Props {
  product: any;
}

export default function ProductClient({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  // --- IMAGES STATE ---
  const allImages = [product.mainImage, ...(product.gallery || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(allImages[0]);

  // --- BUNDLE STATE ---
  const [selectedBundle, setSelectedBundle] = useState(
    product.bundleOptions?.[0] || { 
      title: "Single Pack", 
      count: 1, 
      price: product.price, 
      tag: "Standard" 
    }
  );

  const [qty, setQty] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  // --- STOCK LOGIC ---
  const openingStock = product?.openingStock ?? 0;
  const stockOut = product?.stockOut ?? 0;
  const availableStock = openingStock - stockOut;
  const isOutOfStock = availableStock <= 0;
  
  // Prevent division by zero if bundle count is missing
  const maxQty = selectedBundle.count > 0 ? Math.floor(availableStock / selectedBundle.count) : 0;

  useEffect(() => {
    setQty(1);
  }, [selectedBundle]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, qty, selectedBundle);
    toast.success("Added to Pantry!");
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setIsBuying(true);
    addItem(product, qty, selectedBundle);
    setTimeout(() => router.push("/cart"), 500);
  };

  return (
    <>
      {isBuying && <Loading />}
      
      <div className="bg-cream min-h-screen py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* --- LEFT: GALLERY & MAIN IMAGE --- */}
          <div className="relative lg:sticky lg:top-24 flex flex-col-reverse sm:flex-row gap-4 h-auto sm:h-[600px] z-10">
              
              {/* 1. Vertical Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-24 scrollbar-hide py-2 sm:py-0">
                  {allImages.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 transition-all overflow-hidden ${
                        selectedImage === img 
                          ? "border-brandRed opacity-100 ring-2 ring-brandRed/20" 
                          : "border-charcoal/10 opacity-60 hover:opacity-100 hover:border-charcoal/30"
                      }`}
                    >
                      <Image 
                        src={urlFor(img).width(200).url()} 
                        alt={`View ${i}`} 
                        fill 
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Main Large Image */}
              <div className="flex-1 bg-[#F3EFE0] rounded-[3rem] p-8 border border-charcoal/5 relative overflow-hidden group h-[400px] sm:h-full flex items-center justify-center">
                 <div className="absolute inset-0 border-[3px] border-charcoal/5 rounded-[2.5rem] m-4 pointer-events-none"></div>
                 
                 {product.badge && (
                   <div className="absolute top-8 left-8 bg-brandRed text-cream font-sans font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm">
                     {product.badge}
                   </div>
                 )}
                 
                 <div className="relative w-full h-full p-4">
                   <AnimatePresence mode="wait">
                     {selectedImage && (
                       <motion.div
                         key={selectedImage._key || selectedImage.asset?._ref} 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0 }}
                         transition={{ duration: 0.3 }}
                         className="relative w-full h-full"
                       >
                         <Image
                           src={urlFor(selectedImage).width(800).url()}
                           alt={product.name}
                           fill
                           className="object-contain drop-shadow-2xl"
                           priority
                         />
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
              </div>
          </div>

          {/* --- RIGHT: CONTENT --- */}
          <div className="flex flex-col gap-8">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-brandRed">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs font-bold font-sans text-charcoal/60 tracking-wider uppercase">48 Reviews</span>
              </div>
              
              <h1 className="font-serif text-5xl sm:text-6xl font-black text-charcoal mb-2 leading-[0.9]">
                {product.name}
              </h1>
              
              {product.subtitle && (
                <p className="font-serif italic text-2xl text-charcoal/60 font-light mb-6">
                  {product.subtitle}
                </p>
              )}

              <p className="font-sans text-charcoal/70 text-base sm:text-lg leading-relaxed border-l-2 border-brandRed pl-6">
                {product.description}
              </p>
            </div>

            {/* Benefits */}
            {product.benefits && (
              <div className="flex flex-wrap gap-4 sm:gap-6 py-6 border-y border-charcoal/10">
                {product.benefits.map((benefit: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 opacity-80">
                    <ShieldCheck className="w-4 h-4 text-brandRed" />
                    <span className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">{benefit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bundle Selector */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                 <label className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40">Select Bundle</label>
                 {isOutOfStock && <span className="text-red-500 font-bold text-sm">Out of Stock</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="flex items-center justify-between sm:justify-center gap-4 bg-white px-6 py-4 rounded-full border border-charcoal/10">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))} 
                  disabled={isOutOfStock || qty <= 1}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30"
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
                  className="p-1 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4 text-charcoal" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-serif font-bold text-xl px-8 py-4 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-3
                  ${isOutOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none" : "bg-brandRed text-cream"}
                `}
              >
                {isOutOfStock ? "Sold Out" : "Add to Cart"}
                {!isOutOfStock && (
                  <span className="bg-black/20 px-2 py-0.5 rounded text-base">
                    Rs. {(selectedBundle.price * qty).toLocaleString()}
                  </span>
                )}
              </button>
            </div>

            {/* Nutrition Accordion (Updated Dynamic Version) */}
            <NutritionAccordion nutritionFacts={product.nutritionFacts} />

          </div>
        </div>
      </div>
    </>
  );
}

// --- SUB-COMPONENT: Nutrition Accordion ---
// Defined outside to prevent re-renders and mess
const NutritionAccordion = React.memo(function NutritionAccordion({ nutritionFacts }: { nutritionFacts?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Guard Clause: If no data added in Sanity, hide the whole section
  if (!nutritionFacts || nutritionFacts.length === 0) return null;

  return (
    <div className="border border-charcoal/10 rounded-2xl overflow-hidden mt-6">
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
            className="overflow-hidden"
          >
            <div className="p-6 bg-white text-sm font-sans text-charcoal/80 space-y-2 border-t border-charcoal/5">
              
              {/* DYNAMIC MAPPING START */}
              {nutritionFacts.map((fact, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between pb-2 ${
                    index !== nutritionFacts.length - 1 ? 'border-b border-dashed border-charcoal/20' : ''
                  }`}
                >
                  <span>{fact.label}</span>
                  <span className={`font-bold ${fact.highlight ? "text-brandRed" : "text-charcoal"}`}>
                    {fact.value}
                  </span>
                </div>
              ))}
              {/* DYNAMIC MAPPING END */}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});