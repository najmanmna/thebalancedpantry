"use client";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] w-full min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col justify-center items-center gap-3">
        
        {/* Spinner Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-brandRed"
        >
          <Loader2 className="w-10 h-10" strokeWidth={2.5} />
        </motion.div>

        {/* Text */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="font-serif font-bold text-charcoal text-lg tracking-widest uppercase"
        >
          Preparing Crunch...
        </motion.p>

      </div>
    </div>
  );
};

export default Loading;