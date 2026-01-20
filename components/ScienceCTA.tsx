"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScienceCTA() {
  return (
    <section className="py-16 bg-charcoal text-cream border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        
        {/* Text */}
        <div className="flex items-start gap-6 max-w-2xl">
           <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center flex-shrink-0">
             <FlaskConical className="w-8 h-8 text-cream" />
           </div>
           <div>
             <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
               It's Not Magic. <span className="text-brandRed">It's Physics.</span>
             </h2>
             
             {/* 🔹 REWRITTEN COPY: Focuses on the fruit/science, not "us" */}
             <p className="font-sans text-cream/70 text-lg leading-relaxed">
               How does the fruit retain 98% of its nutrients without exposure to heat or preservatives? 
               <span className="hidden sm:inline"> Explore the sublimation process.</span>
             </p>
           </div>
        </div>

        {/* Action */}
        <Link href="/science">
          <Button className="bg-cream text-charcoal hover:bg-white font-serif font-bold text-lg h-14 px-8 rounded-full transition-transform hover:-translate-y-1">
            See The Science
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>

      </div>
    </section>
  );
}