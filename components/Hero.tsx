"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Snowflake, Leaf, Zap, ShieldCheck, Star } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

// --- Types ---
interface ProductProps {
  name: string;
  subtitle?: string;
  description?: string; // Made optional to prevent crashes
  badge?: string;
  slug?: { current: string };
  mainImage: any;
  benefits?: string[];
}

// --- Constants ---
const BENEFIT_MAP: Record<string, { icon: any; sub: string }> = {
  "Flash Frozen": { icon: Snowflake, sub: "Nutrient Locked" },
  "100% Natural": { icon: Leaf, sub: "No Additives" },
  "Insane Crunch": { icon: Zap, sub: "Sensory Pop" },
  "Gluten Free": { icon: ShieldCheck, sub: "Gut Friendly" },
  "No Added Sugar": { icon: Star, sub: "Pure Fruit" },
};

const DEFAULT_BENEFIT = { icon: Star, sub: "Premium Quality" };

export default function StrawberrySpotlight({ product }: { product: ProductProps }) {
  if (!product) return null;

  // 1. OPTIMIZATION: Generate a specific size URL (Max width needed is ~600px on desktop half-width)
  // We request slightly larger (800w) for high DPI screens, cropped to 4:5 aspect ratio.
  const imageUrl = product.mainImage
    ? urlFor(product.mainImage)
        .width(600)
        .height(600)
        .fit("crop")
        .auto("format") // Forces WebP/AVIF
        .quality(80)
        .auto("format")
        .url()
    : null;

  return (
    <section id="latest-drop" className="relative w-full py-24 bg-cream border-t border-charcoal/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        
        {/* Mobile Badge */}
        <div className="text-center mb-16 lg:hidden">
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
              {product.badge || "Latest Drop"}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* --- LEFT: TEXT CONTENT --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} // Reduced distance for smoother performance
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }} // Load slightly sooner
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left z-10 order-2 lg:order-1"
          >
            {/* Desktop Badge */}
            {product.badge && (
              <div className="hidden lg:block mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-charcoal/20 bg-cream text-charcoal font-sans text-xs font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-brandRed animate-pulse"></span>
                  {product.badge}
                </span>
              </div>
            )}

            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-charcoal leading-[0.9] mb-6">
              {product.name} <br />
              {product.subtitle && (
                <span className="italic font-light opacity-90 text-4xl sm:text-5xl lg:text-6xl block mt-2">
                  {product.subtitle}
                </span>
              )}
            </h2>

            <p className="font-sans text-base sm:text-lg text-charcoal/70 max-w-md mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="#shop" className="w-full sm:w-auto" aria-label={`Shop ${product.name}`}>
                <button className="w-full sm:w-auto bg-brandRed text-cream font-serif font-bold text-lg px-8 py-3 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              
              {product.slug?.current && (
                <Link 
                  href={`/product/${product.slug.current}`} 
                  className="hidden sm:flex items-center gap-2 font-sans font-semibold text-charcoal hover:text-brandRed transition-colors px-6"
                >
                  View Details
                  <div className="h-px w-8 bg-charcoal"></div>
                </Link>
              )}
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mt-8 lg:mt-12 pt-6 border-t border-charcoal/10 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8">
                {product.benefits.map((benefit, index) => {
                  const config = BENEFIT_MAP[benefit] || DEFAULT_BENEFIT;
                  return (
                    <TrustStamp 
                      key={index} 
                      icon={config.icon} 
                      label={benefit} 
                      sub={config.sub} 
                    />
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* --- RIGHT: IMAGE CONTENT --- */}
          <div className="relative flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-dustyRose/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               whileHover={{ 
                 scale: 1.05, 
                 y: -10, 
                 rotate: 2,
                 transition: { duration: 0.3 }
               }}
               className="relative w-full aspect-[4/5] max-w-md sm:max-w-lg lg:max-w-xl cursor-pointer"
            >
               {imageUrl && (
                 <Image 
                   src={imageUrl}
                   alt={`${product.name} - ${product.subtitle || ""}`}
                   fill
                   // 2. OPTIMIZATION: Critical 'sizes' prop
                   // Mobile: 100% width, Tablet: 50%, Desktop: ~600px
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                   className="object-contain drop-shadow-2xl"
                   priority={true} // Change to TRUE if this component is "above the fold"
                 />
               )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Sub-component optimized with React.memo to prevent unnecessary re-renders
const TrustStamp = React.memo(function TrustStamp({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 opacity-80">
      <div className="w-10 h-10 rounded-full border-2 border-charcoal/20 flex items-center justify-center bg-white/50">
        <Icon className="w-4 h-4 text-charcoal" />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif font-bold text-charcoal text-xs leading-tight">{label}</span>
        <span className="font-sans text-[10px] uppercase tracking-wider text-charcoal/60">{sub}</span>
      </div>
    </div>
  );
});