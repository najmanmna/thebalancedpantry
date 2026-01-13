"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Heart, Sun, Smile, Wheat } from "lucide-react";

// Use your existing images
import pantryJar1 from "@/images/pantryJar1.png";
import pantryFruit1 from "@/images/pantryFruit1.png";
import pantryGrain1 from "@/images/pantryGrain1.png";

export default function BrandHero() {
  return (
    <section className="relative w-full min-h-[90dvh] bg-cream flex flex-col justify-center items-center overflow-hidden">
      
      {/* --- 1. BACKGROUND TEXTURE & GRADIENTS --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grain/Noise */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply"></div>
        
        {/* Warm Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(74,55,40,0.03)_100%)]"></div>
        
        {/* Soft Spotlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FADADD]/20 blur-[100px] rounded-full"></div>
      </div>

      {/* --- 2. FLOATING ICON LAYER (The "Happy" Elements) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <FloatingIcon Icon={Sun} top="15%" left="10%" delay={0} size="w-24 h-24" opacity={0.08} />
         <FloatingIcon Icon={Heart} top="10%" right="12%" delay={1} size="w-20 h-20" opacity={0.1} />
         <FloatingIcon Icon={Smile} top="40%" left="5%" delay={2} size="w-16 h-16" opacity={0.12} rotate={-10} />
         <FloatingIcon Icon={Wheat} top="35%" right="8%" delay={1.5} size="w-28 h-28" opacity={0.08} rotate={15} />
      </div>

      {/* --- 3. GROUNDED IMAGE COMPOSITION (The Pantry) --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Group Left: The Oats & Nuts */}
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-[-5%] left-[-10%] sm:bottom-0 sm:left-0 w-[40%] sm:w-[20%] max-w-[300px]"
        >
          <div className="relative aspect-square ">
             <Image src={pantryGrain1} alt="Oats" fill className="object-contain" />
             <div className="absolute bottom-[40%] -right-[20%] w-[70%] h-[70%] -z-10 opacity-80 blur-[1px]">
                <Image src={pantryJar1} alt="Nuts" fill className="object-contain rotate-12" />
             </div>
          </div>
        </motion.div>

        {/* Group Right: The Dried Mango */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute bottom-0 right-[-15%] sm:right-0 w-[50%] sm:w-[25%] max-w-[250px]"
        >
          <div className="relative aspect-square">
             <Image src={pantryFruit1} alt="Mango" fill className="object-contain -rotate-12" />
          </div>
        </motion.div>

      </div>

      {/* --- 4. MAIN CONTENT (Typography) --- */}
      <div className="relative z-10 pt-20 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        
        {/* Brand Stamp */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block border border-charcoal/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm bg-cream/50"
        >
          <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.2em] text-charcoal/60 uppercase">
            Est. 2025 • The Balanced Pantry
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black text-charcoal leading-[1.05] mb-8"
        >
          Curated <br className="sm:hidden" /> for a <br />
          <span className="relative inline-block text-brandRed">
            Happier You.
            {/* Elegant Underline */}
            <svg className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-3 sm:h-5 text-dustyRose/30" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </span>
        </motion.h1>

        {/* Mission Statement */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-sans text-base sm:text-xl text-charcoal/70 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          We curate products that support a 
          <strong className="text-charcoal font-bold"> healthier way of eating</strong>. 
          No fillers, no fake stuff—just honest ingredients.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col items-center gap-2 text-charcoal/30"
        >
          <span className="text-[9px] uppercase tracking-widest font-bold">Scroll to Discover</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.div>

      </div>
    </section>
  );
}

// Sub-component for floating icons
function FloatingIcon({ Icon, top, left, right, bottom, delay, size, opacity, rotate = 0 }: any) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ 
            opacity: opacity, 
            scale: 1, 
            y: [0, -15, 0], // The floating animation
            rotate: rotate
        }}
        transition={{ 
          opacity: { duration: 1, delay },
          scale: { duration: 1, delay },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }, // Slow, continuous float
          rotate: { duration: 1 }
        }}
        className={`absolute text-charcoal ${size}`}
        style={{ top, left, right, bottom }}
      >
        <Icon className="w-full h-full" strokeWidth={1.5} />
      </motion.div>
    );
  }