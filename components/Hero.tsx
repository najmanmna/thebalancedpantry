"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Snowflake, Leaf, Zap } from "lucide-react";
import strawberrybowl from "@/images/strawberry-bowl-transparent.png";
// Removed unused strawberryslice import

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const textVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Hero() {
  return (
    <section className="relative w-full min-h-[100dvh] bg-cream flex justify-center overflow-hidden">
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply"></div>

      {/* Padding to clear fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full pt-24 pb-20 lg:pt-24 lg:pb-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          
          {/* --- LEFT SIDE: TEXT --- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left z-10 order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div variants={textVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-charcoal/20 bg-white/50 backdrop-blur-sm text-charcoal font-sans text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brandRed animate-pulse"></span>
                New Arrival
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={textVariants}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-charcoal leading-[0.9] mb-6"
            >
              The Nostalgia <br />
              <span className="italic font-light opacity-90 text-4xl sm:text-5xl lg:text-7xl">of Fresh Fruit,</span> <br />
              <span className="text-brandRed relative inline-block mt-2">
                Now Crunchy.
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-dustyRose opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={textVariants}
              className="font-sans text-base sm:text-lg text-charcoal/70 max-w-md mb-8 leading-relaxed"
            >
              100% Whole Strawberries. Flash-frozen to lock in nature’s sweetness. 
              No sugar, no guilt—just the <strong className="text-brandRed">perfect crunch</strong>.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={textVariants}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="#shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-brandRed text-cream font-serif font-bold text-lg px-8 py-3 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-2">
                  Shop Strawberries
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              <Link href="/our-story" className="hidden sm:flex items-center gap-2 font-sans font-semibold text-charcoal hover:text-brandRed transition-colors px-6">
                See How It's Made
                <div className="h-px w-8 bg-charcoal group-hover:w-12 group-hover:bg-brandRed transition-all"></div>
              </Link>
            </motion.div>

            {/* Trust Stamps */}
            <motion.div 
              variants={textVariants}
              className="mt-8 lg:mt-12 pt-6 border-t border-charcoal/10 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8"
            >
              <TrustStamp icon={Snowflake} label="Flash Frozen" sub="Nutrient Locked" />
              <TrustStamp icon={Leaf} label="100% Natural" sub="No Additives" />
              <TrustStamp icon={Zap} label="Insane Crunch" sub="Sensory Pop" />
            </motion.div>
          </motion.div>

          {/* --- RIGHT SIDE: IMAGE --- */}
          <div className="relative z-0 flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0 lg:mt-10">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-dustyRose/20 rounded-full blur-3xl opacity-60"></div>

            {/* Bowl Container */}
            <div className="relative w-full aspect-[4/5] max-w-md sm:max-w-lg lg:max-w-xl h-full cursor-pointer">
              
              {/* Bowl with "Lift & Present" Hover Effect */}
              <motion.div 
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10, 
                  rotate: 2,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full h-full z-10"
              >
                <Image 
                  src={strawberrybowl}
                  alt="Wooden bowl full of crunchy freeze dried strawberries"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TrustStamp({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 opacity-80 hover:opacity-100 transition-opacity">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-charcoal/20 flex items-center justify-center bg-white/50">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal" />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif font-bold text-charcoal text-xs sm:text-sm leading-tight">{label}</span>
        <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-charcoal/60">{sub}</span>
      </div>
    </div>
  );
}