"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Heart, Sun, Smile, Wheat, LucideIcon } from "lucide-react";

// Images
import pantryJar1 from "@/images/pantryJar1.png";
import pantryFruit1 from "@/images/pantryFruit1.png";
import pantryGrain1 from "@/images/pantryGrain1.png";

// --- Constants ---
// Optimization: Use a Data URI for noise instead of an external HTTP request (Zero Latency)
const NOISE_PATTERN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

export default function BrandHero() {
  return (
    <section className="relative w-full min-h-[90dvh] bg-cream flex flex-col justify-center items-center overflow-hidden">
      
      {/* --- 1. BACKGROUND TEXTURE & GRADIENTS --- */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Optimized Noise Layer */}
        <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ backgroundImage: NOISE_PATTERN }}
        ></div>
        
        {/* Warm Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(74,55,40,0.03)_100%)]"></div>
        
        {/* Soft Spotlights (Will-change for performance) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FADADD]/20 blur-[100px] rounded-full will-change-transform"></div>
      </div>

      {/* --- 2. FLOATING ICON LAYER --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <FloatingIcon Icon={Sun} top="15%" left="10%" delay={0} size="w-24 h-24" opacity={0.08} />
         <FloatingIcon Icon={Heart} top="10%" right="12%" delay={1} size="w-20 h-20" opacity={0.1} />
         <FloatingIcon Icon={Smile} top="40%" left="5%" delay={2} size="w-16 h-16" opacity={0.12} rotate={-10} />
         <FloatingIcon Icon={Wheat} top="35%" right="8%" delay={1.5} size="w-28 h-28" opacity={0.08} rotate={15} />
      </div>

      {/* --- 3. GROUNDED IMAGE COMPOSITION (Critical LCP Elements) --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Group Left: The Oats & Nuts */}
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="absolute bottom-[-5%] left-[-10%] sm:bottom-0 sm:left-0 w-[40%] sm:w-[20%] max-w-[300px]"
        >
          <div className="relative aspect-square">
             <Image 
                src={pantryGrain1} 
                alt="Healthy Oats" 
                fill 
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-contain"
                priority // Load ASAP
             />
             <div className="absolute bottom-[40%] -right-[20%] w-[70%] h-[70%] -z-10 opacity-80 blur-[1px]">
                <Image 
                    src={pantryJar1} 
                    alt="Nuts Jar" 
                    fill 
                    sizes="(max-width: 768px) 30vw, 15vw"
                    className="object-contain rotate-12"
                    priority // Load ASAP
                />
             </div>
          </div>
        </motion.div>

        {/* Group Right: The Dried Mango */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="absolute bottom-0 right-[-15%] sm:right-0 w-[50%] sm:w-[25%] max-w-[250px]"
        >
          <div className="relative aspect-square">
             <Image 
                src={pantryFruit1} 
                alt="Dried Mango" 
                fill 
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain -rotate-12"
                priority // Load ASAP
             />
          </div>
        </motion.div>

      </div>

      {/* --- 4. MAIN CONTENT --- */}
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
          Low Calorie and Wholesome Products that support better eating.
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

// --- Sub-Components ---

interface FloatingIconProps {
    Icon: LucideIcon;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    delay: number;
    size: string;
    opacity: number;
    rotate?: number;
}

// Optimized with React.memo to prevent unnecessary re-renders during parent state changes
const FloatingIcon = React.memo(function FloatingIcon({ Icon, top, left, right, bottom, delay, size, opacity, rotate = 0 }: FloatingIconProps) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ 
            opacity: opacity, 
            scale: 1, 
            y: [0, -15, 0], 
            rotate: rotate
        }}
        transition={{ 
          opacity: { duration: 1, delay },
          scale: { duration: 1, delay },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }, 
          rotate: { duration: 1 }
        }}
        className={`absolute text-charcoal ${size}`}
        style={{ top, left, right, bottom }}
      >
        <Icon className="w-full h-full" strokeWidth={1.5} />
      </motion.div>
    );
});