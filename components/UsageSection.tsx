"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Utensils, IceCream, Cookie } from "lucide-react";

// Animation for the cards appearing one by one
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function UsageSection() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      
      {/* 1. SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center mb-16">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase mb-2 block"
        >
          Versatility
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal"
        >
          More Than Just <br/> A <span className="text-brandRed decoration-4 underline decoration-dustyRose/30 underline-offset-4">Snack.</span>
        </motion.h2>
      </div>

      {/* 2. THE RECIPE CARDS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD 1: SNACK */}
        <UsageCard 
          index={0}
          icon={Utensils}
          title="Snack It Solo"
          desc="Straight from the bag. The perfect guilt-free crunch for movie nights or midday cravings."
          color="bg-[#FADADD]" // Very light pink
          rotate="-rotate-2"
        />

        {/* CARD 2: TOPPING (Center - slightly higher/larger) */}
        <UsageCard 
          index={1}
          icon={IceCream}
          title="The Breakfast Upgrade"
          desc="Scatter over yogurt, oatmeal, or acai bowls. Turns a boring morning into a treat."
          color="bg-[#E0F2F1]" // Very light teal/sage
          rotate="rotate-2"
          className="md:-translate-y-4 z-10" // Lifts it up slightly
        />

        {/* CARD 3: BAKE/BLEND */}
        <UsageCard 
          index={2}
          icon={Cookie}
          title="Bake & Blend"
          desc="Crush it into dust for frosting, or fold into muffin batter for intense flavor without the moisture."
          color="bg-[#FFF3E0]" // Very light orange/cream
          rotate="-rotate-1"
        />

      </div>

      {/* 3. CTA LINK */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <p className="font-sans text-charcoal/60 text-sm mb-4">Have a creative recipe?</p>
        <a href="https://www.instagram.com/the_balanced_pantry_lk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw== hover:border-brandRed transition-colors pb-0.5">
          Tag us @TheBalancedPantry
        </a>
      </motion.div>

    </section>
  );
}

// --- SUB-COMPONENT: RECIPE CARD ---
interface UsageCardProps {
  index: number;
  icon: any;
  title: string;
  desc: string;
  color: string;
  rotate: string;
  className?: string;
}

function UsageCard({ index, icon: Icon, title, desc, color, rotate, className = "" }: UsageCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={cardVariants}
      whileHover={{ scale: 1.05, rotate: 0, transition: { duration: 0.3 } }}
      className={`relative group bg-white p-8 rounded-3xl border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] flex flex-col items-center text-center ${rotate} ${className}`}
    >
      {/* Tape Effect (Top Center) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/40 backdrop-blur-sm border-l border-r border-white/50 rotate-1 shadow-sm opacity-50"></div>

      {/* Icon Circle */}
      <div className={`w-16 h-16 rounded-full ${color} border-2 border-charcoal flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-charcoal" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">{title}</h3>
      <p className="font-sans text-charcoal/70 leading-relaxed text-sm">
        {desc}
      </p>

      {/* Corner Number */}
      <span className="absolute bottom-4 right-6 font-serif text-4xl text-charcoal/5 font-black select-none">
        0{index + 1}
      </span>
    </motion.div>
  );
}