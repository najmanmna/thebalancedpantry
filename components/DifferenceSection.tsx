"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, Check, Thermometer, Droplets, Zap, Leaf } from "lucide-react";

// You will need placeholder images for "Regular Dried Fruit" (e.g., raisins/shriveled mango) 
// and "Freeze Dried Strawberry" (Bright red/puffy).

const FeatureRow = ({ icon: Icon, text, isPositive }: { icon: any, text: string, isPositive: boolean }) => (
  <div className={`flex items-center gap-3 ${isPositive ? "opacity-100" : "opacity-60 grayscale"}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isPositive ? "bg-brandRed text-cream border-brandRed" : "bg-charcoal/10 text-charcoal border-charcoal/20"}`}>
      {isPositive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </div>
    <span className={`font-sans font-bold text-sm sm:text-base ${isPositive ? "text-charcoal" : "text-charcoal/60 line-through decoration-charcoal/40"}`}>
      {text}
    </span>
  </div>
);

export default function DifferenceSection() {
  return (
    <section className="relative w-full py-20 bg-[#EBE5D5] overflow-hidden">
      
      {/* Background Texture (Optional) */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans text-xs font-bold tracking-[0.2em] text-charcoal/60 uppercase"
          >
            The Science of Snacking
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal mt-3"
          >
            Forget What You Know <br/> About <span className="italic text-brandRed">Dried Fruit.</span>
          </motion.h2>
        </div>

        {/* The Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center max-w-5xl mx-auto">
          
          {/* LEFT: THE OLD WAY (Dehydrated) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#D6D1C4] p-8 sm:p-12 rounded-3xl lg:rounded-r-none lg:rounded-l-3xl border border-charcoal/5 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-bold text-charcoal/50 mb-6">Regular Dried Fruit</h3>
              <div className="space-y-4">
                <FeatureRow icon={Thermometer} text="Heat Damaged Nutrients" isPositive={false} />
                <FeatureRow icon={Droplets} text="Chewy & Sticky Texture" isPositive={false} />
                <FeatureRow icon={Zap} text="Added Sugar/Syrups" isPositive={false} />
              </div>
            </div>
            {/* Faded Background Text */}
            <span className="absolute -bottom-4 -right-4 font-serif text-9xl text-charcoal/5 font-black pointer-events-none select-none">
              OLD
            </span>
          </motion.div>

          {/* RIGHT: THE BALANCED WAY (Freeze Dried) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-cream p-8 sm:p-12 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl border-2 border-brandRed shadow-[8px_8px_0px_0px_rgba(214,69,69,0.2)] relative z-20 scale-105"
          >
            <div className="absolute top-0 right-0 bg-brandRed text-cream text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              The Upgrade
            </div>

            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">Freeze Dried</h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brandRed/10 flex items-center justify-center text-brandRed">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">98% Nutrient Retention</h4>
                  <p className="text-xs text-charcoal/70">Flash-frozen to lock in vitamins.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brandRed/10 flex items-center justify-center text-brandRed">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">Insane Crunch</h4>
                  <p className="text-xs text-charcoal/70">Airy, light, and never sticky.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brandRed/10 flex items-center justify-center text-brandRed">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">100% Real Fruit</h4>
                  <p className="text-xs text-charcoal/70">No sugar. No preservatives. Just fruit.</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}