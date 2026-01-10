"use client";
import { ShoppingBag, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmptyCart() {
  return (
    <div className="py-20 flex items-center justify-center p-4 bg-cream/50 min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[2rem] border-2 border-charcoal shadow-[8px_8px_0px_0px_#4A3728] p-8 sm:p-12 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Background Texture (Optional) */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

        {/* Animated Icon Container */}
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
          }}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          {/* Circle Background */}
          <div className="w-full h-full rounded-full bg-[#F3EFE0] border-2 border-charcoal flex items-center justify-center">
             <ShoppingBag className="w-12 h-12 text-charcoal/20" />
          </div>

          {/* Floating '?' Badge */}
          <motion.div
            animate={{
              y: [0, -5, 5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
            className="absolute top-0 right-0 bg-brandRed text-cream rounded-full w-10 h-10 flex items-center justify-center border-2 border-charcoal shadow-sm z-10"
          >
            <Search size={18} strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <div className="relative z-10 space-y-4 mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-charcoal">
            Your Pantry is Bare
          </h2>
          <p className="font-sans text-charcoal/70 text-base leading-relaxed">
            Looks like you haven&apos;t picked your snacks yet. 
            The strawberries are lonely!
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10">
          <Link href="/" className="block w-full">
            <button className="w-full bg-brandRed text-cream font-serif font-bold text-lg px-8 py-3.5 rounded-full border-2 border-charcoal shadow-[4px_4px_0px_0px_#4A3728] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4A3728] transition-all flex items-center justify-center gap-2 group">
              Start Snacking
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>

      </motion.div>
    </div>
  );
}