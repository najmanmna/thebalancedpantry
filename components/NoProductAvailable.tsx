"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, PackageOpen } from "lucide-react";

const NoProductAvailable = ({
  selectedTab,
  className,
}: {
  selectedTab?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 min-h-[400px] space-y-6 text-center bg-white/50 border-2 border-dashed border-charcoal/10 rounded-[2.5rem] w-full mt-10 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-2"
      >
        <PackageOpen className="w-10 h-10 text-charcoal/40" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-3xl font-serif font-black text-charcoal mb-2">
          Pantry is Empty
        </h2>
        
        <p className="text-charcoal/60 font-sans text-lg max-w-md mx-auto leading-relaxed px-4">
          We couldn't find any products in the{" "}
          <span className="font-bold text-brandRed underline decoration-brandRed/30 decoration-2 underline-offset-4">
            {selectedTab || "current"}
          </span>{" "}
          category right now.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center gap-3 bg-brandRed/5 px-5 py-2.5 rounded-full border border-brandRed/10 text-brandRed font-sans font-semibold text-sm"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Restocking shortly...</span>
      </motion.div>
    </div>
  );
};

export default NoProductAvailable;