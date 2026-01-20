"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Snowflake, Wind, Sun, ArrowRight, Zap,Leaf, Droplets, ThermometerSnowflake } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have this or use standard button

// --- ASSETS (Replace with your actual images) ---
// For the best effect, use the SAME strawberry image but edit it slightly for each stage if possible,
// or just use one good transparent PNG and we will manipulate it with CSS filters.
import freshStrawberry from "@/images/strawberry-slice-1.png"; 

export default function SciencePage() {
  return (
  <main className="bg-cream min-h-screen">
      <HeroSection />
      <ProcessScrollyTelling />
      <ComparisonSection />
      <NutrientRetention />
      <CTASection />
    </main>
  );
}

// ------------------------------------------------------------------
// 1. HERO SECTION: "The Physics of Crunch"
// ------------------------------------------------------------------
function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
         {/* Abstract icy background */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <span className="font-sans font-bold text-brandRed tracking-[0.3em] text-sm uppercase mb-4 block">
            The Process
          </span>
          <h1 className="font-serif text-6xl md:text-8xl font-black text-charcoal mb-6 leading-[0.9]">
            It’s Not Magic. <br/>
            <span className="italic font-light text-blue-900/60">It’s Sublimation.</span>
          </h1>
          <p className="font-sans text-xl text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
            How we turn fresh, juicy fruit into a shelf-stable crunch without using heat, preservatives, or added sugar.
          </p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12"
          >
            <div className="animate-bounce text-charcoal/40 flex flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">Scroll to Freeze</span>
              <ArrowRight className="rotate-90 w-5 h-5" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// 2. THE INTERACTIVE PROCESS (SCROLLYTELLING)
// ------------------------------------------------------------------

  const STEPS = [
  {
    id: "fresh",
    title: "1. The Harvest",
    // Changed "We pick" to "Fruit is harvested"
    desc: "Fruit is harvested at peak ripeness. This is the precise moment it holds full flavor and maximum nutrient density.",
    icon: Sun,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "frozen",
    title: "2. Flash Freezing",
    // Already passive, kept as is.
    desc: "The fruit is instantly frozen to -40°C. This locks the cellular structure in place, trapping vitamins and enzymes.",
    icon: Snowflake,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "vacuum",
    title: "3. The Vacuum Chamber",
    // Changed "We lower" to "Pressure is lowered"
    desc: "Pressure is lowered to create a deep vacuum environment. This is where the physics gets weird.",
    icon: Wind,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "sublimation",
    title: "4. Sublimation",
    // Physics description, kept as is.
    desc: "Ice turns DIRECTLY into vapor, skipping the liquid phase entirely. The water leaves, but the flavor and structure stay.",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "crunch",
    title: "5. The Crunch",
    // Result description, kept as is.
    desc: "What's left? A lightweight, airy, intensely flavorful fruit with 98% of its nutrients intact.",
    icon: Leaf, 
    color: "bg-brandRed/10 text-brandRed",
  }
];



function ProcessScrollyTelling() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative bg-white border-t border-charcoal/5">
      
      {/* --- MOBILE LAYOUT (< 1024px) --- */}
      <div className="lg:hidden">
        
        {/* 1. The Visualizer (Sticky at Top) */}
        <div className="sticky top-16 z-0 h-[45vh] w-full flex items-center justify-center bg-[#F3EFE0] border-b border-charcoal/5 overflow-hidden">
           <div className="scale-75">
             <StrawberryVisualizer stepIndex={activeStep} />
           </div>
        </div>

        {/* 2. The Text Cards (Scrolls over) */}
        <div className="relative z-10 px-4 pb-20 -mt-8">
           <div className="flex flex-col gap-[40vh]">
              {STEPS.map((step, index) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  index={index} 
                  onInView={() => setActiveStep(index)}
                  isMobile={true} // New prop for styling
                />
              ))}
           </div>
        </div>
      </div>


      {/* --- DESKTOP LAYOUT (>= 1024px) --- */}
      <div className="hidden lg:grid max-w-7xl mx-auto px-8 grid-cols-2">
        {/* Left: Text */}
        <div className="flex flex-col gap-[80vh] py-[50vh]">
          {STEPS.map((step, index) => (
            <StepCard 
              key={step.id} 
              step={step} 
              index={index} 
              onInView={() => setActiveStep(index)} 
            />
          ))}
        </div>

        {/* Right: Sticky Visualizer */}
        <div className="relative h-full">
           <div className="sticky top-0 h-screen flex items-center justify-center">
              <StrawberryVisualizer stepIndex={activeStep} />
           </div>
        </div>
      </div>

    </section>
  );
}
// Individual Step Text Component
function StepCard({ step, index, onInView, isMobile }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0.2, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onViewportEnter={onInView}
      viewport={{ margin: "-50% 0px -50% 0px" }} // Trigger at center
      
      // Responsive Styling
      className={`
        relative border border-charcoal/5 shadow-sm
        ${isMobile 
           ? "bg-white/95 backdrop-blur-md p-6 rounded-3xl" // Mobile: Compact, Glassy
           : "bg-cream/50 p-10 rounded-[2.5rem]" // Desktop: Spacious, airy
        }
      `}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center`}>
          <step.icon className="w-5 h-5" />
        </div>
        <h3 className={`font-serif font-bold text-charcoal ${isMobile ? "text-2xl" : "text-4xl"}`}>
          {step.title}
        </h3>
      </div>
      
      <p className="font-sans text-charcoal/70 leading-relaxed text-base">
        {step.desc}
      </p>

      {/* Contextual Images for deeper learning */}
      {index === 2 && !isMobile && (
         <div className="mt-4 p-4 bg-white rounded-xl border border-charcoal/5">
            <span className="text-xs font-bold uppercase text-charcoal/40 mb-2 block">Process Diagram</span>
             

         </div>
      )}

      {index === 3 && !isMobile && (
         <div className="mt-4 p-4 bg-white rounded-xl border border-charcoal/5">
            <span className="text-xs font-bold uppercase text-charcoal/40 mb-2 block">Phase Diagram</span>
            
         </div>
      )}
    </motion.div>
  );
}
// ------------------------------------------------------------------
// 3. THE VISUALIZER (The Magic Part)
// ------------------------------------------------------------------
function StrawberryVisualizer({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center bg-[#F3EFE0] rounded-full border border-charcoal/5 shadow-2xl overflow-hidden transition-colors duration-700">
      
      {/* Background Ambience based on step */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${stepIndex === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
      </div>

      {/* STRAWBERRY CONTAINER */}
      <div className="relative w-64 h-64 z-10">
        
        {/* The Image (We animate filters on it) */}
        <motion.div
          animate={{
            scale: stepIndex === 4 ? 0.9 : 1, // Shrinks slightly at end
            filter: stepIndex === 1 
              ? "brightness(0.9) hue-rotate(10deg) saturate(0.8)" // Frozen look
              : stepIndex === 4 
                ? "saturate(1.2) contrast(1.1)" // Dried look (intense color)
                : "none",
            rotate: stepIndex === 4 ? [0, -5, 5, 0] : 0, // Shake on crunch
          }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {/* Replace with your image */}
           {/* 

[Image of Strawberry]
 */}
          <Image 
            src={freshStrawberry} 
            alt="Strawberry Science" 
            fill 
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* OVERLAY: ICE CRYSTALS (Stage 1) */}
        <AnimatePresence>
          {stepIndex === 1 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(6)].map((_, i) => (
                <Snowflake key={i} className={`absolute w-8 h-8 text-white/80 animate-pulse`} 
                  style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY: VAPOR PARTICLES (Stage 2 & 3) */}
        <AnimatePresence>
          {(stepIndex === 2 || stepIndex === 3) && (
            <motion.div className="absolute inset-0">
               {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1, scale: 0 }}
                    animate={{ 
                      y: -100 - Math.random() * 100, 
                      x: (Math.random() - 0.5) * 50,
                      opacity: 0, 
                      scale: 1.5 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1 + Math.random(), 
                      delay: Math.random() * 0.5 
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full blur-[2px]"
                  />
               ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY: CRUNCH LINES (Stage 4) */}
        <AnimatePresence>
          {stepIndex === 4 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} 
               animate={{ opacity: 1, scale: 1.2 }} 
               className="absolute -inset-10 border-4 border-brandRed/20 rounded-full"
             />
          )}
        </AnimatePresence>

      </div>

      {/* Data Label */}
      <div className="absolute bottom-10 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-sm">
        <span className="font-mono font-bold text-charcoal">
          {stepIndex === 0 && "Temp: 25°C | Pressure: 1 atm"}
          {stepIndex === 1 && "Temp: -40°C | State: Solid"}
          {stepIndex === 2 && "Pressure: <0.06 atm | Vacuum On"}
          {stepIndex === 3 && "H2O State: Sublimating..."}
          {stepIndex === 4 && "H2O: <2% | Crunch: 100%"}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 4. COMPARISON SECTION (Why it's better)
// ------------------------------------------------------------------
function ComparisonSection() {
  return (
    <section className="py-24 bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
        <h2 className="font-serif text-5xl font-bold mb-16">The Superior Snack.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CompareCard 
            title="Dehydrated"
            subtitle="(Traditional Dried Fruit)"
            temp="Heat (+70°C)"
            texture="Chewy / Leathery"
            nutrition="~60% Lost"
            verdict="Cooking kills the good stuff."
            opacity="opacity-50"
          />
          <CompareCard 
            title="Freeze Dried"
            subtitle="(The Balanced Pantry)"
            temp="Cold (-40°C)"
            texture="Light / Crunchy"
            nutrition="98% Retained"
            verdict="Nature, paused in time."
            isWinner
          />
          <CompareCard 
            title="Canned"
            subtitle="(Syrup Soaked)"
            temp="Boiled"
            texture="Mushy"
            nutrition="Sugar Added"
            verdict="Ideally for deserts only."
            opacity="opacity-50"
          />
        </div>
      </div>
    </section>
  );
}

function CompareCard({ title, subtitle, temp, texture, nutrition, verdict, isWinner, opacity = "" }: any) {
  return (
    <div className={`p-8 rounded-3xl border ${isWinner ? "bg-cream text-charcoal border-brandRed scale-105 shadow-2xl relative z-10" : "bg-white/5 border-white/10 " + opacity}`}>
       <h3 className="font-serif text-3xl font-bold mb-1">{title}</h3>
       <p className="text-xs uppercase tracking-widest mb-8 opacity-70">{subtitle}</p>
       
       <div className="space-y-6 text-left">
          <CompareRow label="Process" value={temp} isWinner={isWinner} />
          <CompareRow label="Texture" value={texture} isWinner={isWinner} />
          <CompareRow label="Nutrients" value={nutrition} isWinner={isWinner} />
       </div>

       <div className="mt-8 pt-6 border-t border-current/10">
          <p className="font-bold italic">"{verdict}"</p>
       </div>
    </div>
  );
}

function CompareRow({ label, value, isWinner }: any) {
  return (
    <div className="flex justify-between items-center border-b border-current/10 pb-2">
      <span className="text-sm font-sans opacity-70">{label}</span>
      <span className={`font-bold ${isWinner ? "text-brandRed" : ""}`}>{value}</span>
    </div>
  );
}

// ------------------------------------------------------------------
// 5. NUTRIENT RETENTION CHART
// ------------------------------------------------------------------
function NutrientRetention() {
  return (
    <section className="py-24 bg-cream">
       <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl font-bold text-charcoal mb-12">Vitamin C Retention</h2>
          
          {/* Increased height (h-80) to give the badge room to float without pushing alignment */}
          <div className="w-full h-80 flex items-end justify-center gap-12 md:gap-24 pb-4">

             {/* Freeze Dried (98%) - The Winner */}
             <div className="w-32 h-full flex flex-col justify-end items-center relative z-10">
                {/* Badge */}
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.8 }}
                   className="mb-3 bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-brandRed border border-brandRed/10 whitespace-nowrap"
                >
                   Balanced Pantry
                </motion.div>
                
                <span className="font-bold text-brandRed text-3xl mb-2">98%</span>
                
                <motion.div 
                   initial={{ height: 0 }} 
                   whileInView={{ height: "80%" }} 
                   transition={{ duration: 1 }}
                   className="w-full bg-brandRed rounded-t-2xl relative shadow-[0_20px_50px_-12px_rgba(214,69,69,0.3)]"
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 rounded-tr-2xl"></div>
                </motion.div>
                <span className="font-sans font-bold text-brandRed mt-4 text-lg">Freeze Dried</span>
             </div>

             {/* Dehydrated (60%) */}
             <div className="w-32 h-full flex flex-col justify-end items-center opacity-40">
                <span className="font-bold text-charcoal text-3xl mb-2">60%</span>
                
                {/* Adjusted height to be visually proportional to 98% (approx 60% relative height) */}
                <motion.div 
                   initial={{ height: 0 }} 
                   whileInView={{ height: "48%" }} 
                   transition={{ duration: 1, delay: 0.2 }}
                   className="w-full bg-charcoal rounded-t-2xl"
                ></motion.div>
                <span className="font-sans font-bold text-charcoal mt-4 text-lg">Dehydrated</span>
             </div>

          </div>

          <p className="mt-12 text-charcoal/70 max-w-lg mx-auto leading-relaxed">
             Since high heat is never used, sensitive vitamins (like Vitamin C and A) remain intact. It provides the nutritional equivalent of fresh fruit, simply without the water weight.
          </p>
       </div>
    </section>
  );
}

// ------------------------------------------------------------------
// 6. CTA
// ------------------------------------------------------------------
function CTASection() {
  return (
    <section className="py-24 bg-white border-t border-charcoal/5 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-serif text-5xl font-black text-charcoal mb-6">
          Taste the <span className="text-brandRed">Science.</span>
        </h2>
        <p className="text-lg text-charcoal/60 mb-8">
          Experience the crunch that physics built. No additives, just pure fruit engineering.
        </p>
        <Link href="/shop/all">
          <Button className="bg-brandRed text-cream text-xl px-10 py-6 rounded-full font-serif font-bold shadow-[4px_4px_0px_0px_#4A3728] hover:shadow-[2px_2px_0px_0px_#4A3728] hover:translate-y-[2px] transition-all">
             Shop The Pantry
          </Button>
        </Link>
      </div>
    </section>
  );
}