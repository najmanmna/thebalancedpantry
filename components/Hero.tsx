"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Snowflake, Leaf, Zap, ShieldCheck, Star } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

// 1. Icon Mapping Logic
// This ensures that if you add "100% Natural" in Sanity, it gets the Leaf icon automatically.
const BENEFIT_MAP: Record<string, { icon: any; sub: string }> = {
  "Flash Frozen": { icon: Snowflake, sub: "Nutrient Locked" },
  "100% Natural": { icon: Leaf, sub: "No Additives" },
  "Insane Crunch": { icon: Zap, sub: "Sensory Pop" },
  "Gluten Free": { icon: ShieldCheck, sub: "Gut Friendly" },
  "No Added Sugar": { icon: Star, sub: "Pure Fruit" },
};

// Fallback if a new tag is added in Sanity that isn't mapped yet
const DEFAULT_BENEFIT = { icon: Star, sub: "Premium Quality" };

export default function StrawberrySpotlight({ product }: { product: any }) {
  // Guard clause: If data isn't loaded yet, show nothing (or a skeleton)
  if (!product) return null;

  return (
    <section id="latest-drop" className="relative w-full py-24 bg-cream border-t border-charcoal/5 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        
        {/* Section Label (Mobile) */}
        <div className="text-center mb-16 lg:hidden">
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
              {product.badge || "Latest Drop"}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* --- LEFT: TEXT CONTENT --- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
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

            {/* TYPOGRAPHY STRATEGY:
                We split the Product Title and Subtitle to recreate the visual hierarchy.
                Title -> "The Nostalgia..."
                Subtitle -> "...of Fresh Fruit"
            */}
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-charcoal leading-[0.9] mb-6">
              {/* Part 1: The Main Title (e.g. "The Nostalgia") */}
              {product.name} <br />
              
              {/* Part 2: The Subtitle (e.g. "of Fresh Fruit") */}
              {product.subtitle && (
                <span className="italic font-light opacity-90 text-4xl sm:text-5xl lg:text-6xl block mt-2">
                  {product.subtitle}
                </span>
              )}
              
              {/* Part 3: Hardcoded Slogan or extra field if needed */}
              {/* <span className="text-brandRed relative inline-block mt-2 text-4xl sm:text-5xl">
                Now Crunchy.
              </span> */}
            </h2>

            <p className="font-sans text-base sm:text-lg text-charcoal/70 max-w-md mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Scroll to shop section */}
              <Link href="#shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-brandRed text-cream font-serif font-bold text-lg px-8 py-3 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href={`/shop/${product.slug?.current}`} className="hidden sm:flex items-center gap-2 font-sans font-semibold text-charcoal hover:text-brandRed transition-colors px-6">
                View Details
                <div className="h-px w-8 bg-charcoal"></div>
              </Link>
            </div>

            {/* Dynamic Trust Stamps */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mt-8 lg:mt-12 pt-6 border-t border-charcoal/10 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8">
                {product.benefits.map((benefit: string, index: number) => {
                  // Find the matching icon/subtext, or use default
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
             {/* Background Blob */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-dustyRose/20 rounded-full blur-3xl opacity-60"></div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               whileHover={{ 
                  scale: 1.05, 
                  y: -10, 
                  rotate: 2,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
               className="relative w-full aspect-[4/5] max-w-md sm:max-w-lg lg:max-w-xl cursor-pointer"
            >
               {product.mainImage && (
                 <Image 
                    src={urlFor(product.mainImage).url()}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                 />
               )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TrustStamp({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
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
}