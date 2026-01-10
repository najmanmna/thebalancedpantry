"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Is there any added sugar?",
    answer: "Zero. None. Zilch. The sweetness you taste is 100% from the ripe strawberries themselves. We just remove the water, not the flavor."
  },
  {
    question: "Is the texture chewy or crispy?",
    answer: "It is NOT chewy (that's dehydrated fruit). Freeze-dried fruit is light, airy, and has a satisfying 'styrofoam-like' crunch that melts in your mouth."
  },
  {
    question: "How long does a pack last?",
    answer: "If unopened, it stays fresh for 12 months. Once opened, we recommend finishing it within 3-4 days (and keeping the zipper tight!) to maintain that supreme crunch."
  },
  {
    question: "Is this safe for toddlers?",
    answer: "Absolutely! It's actually a favorite for moms because it melts in the mouth, reducing choking hazards compared to fresh slippery fruit. Plus, no sticky mess!"
  },
  {
    question: "Do you deliver islandwide?",
    answer: "Yes, we deliver to any doorstep in Sri Lanka within 2-4 working days."
  }
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-[#EBE5D5] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.2em] text-charcoal/60 uppercase">
            Common Questions
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-black text-charcoal mt-3">
            Curious <span className="text-brandRed">Minds.</span>
          </h2>
        </div>

        {/* Accordion Grid */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>

      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden transition-all duration-300 hover:border-charcoal/30 hover:shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-serif font-bold text-lg text-charcoal">{question}</span>
        <div className={`p-2 rounded-full transition-colors ${isOpen ? "bg-brandRed text-white" : "bg-charcoal/5 text-charcoal"}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-6 pb-6 pt-0 font-sans text-charcoal/70 leading-relaxed text-sm sm:text-base">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}