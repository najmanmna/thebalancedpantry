"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircleQuestion } from "lucide-react";

interface FAQItem {
  _key: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FAQItem[] | null | undefined;
}

export default function ProductFAQ({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // If no FAQs are added in Sanity, don't render the section
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-12 border-t border-charcoal/5 mt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-brandRed/10 rounded-full">
            <MessageCircleQuestion className="w-5 h-5 text-brandRed" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-charcoal">
            Common Questions
        </h3>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div 
            key={faq._key} 
            className="border border-charcoal/10 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-charcoal/30 hover:shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-sans font-bold text-charcoal text-lg pr-4">
                {faq.question}
              </span>
              <div className={`flex-shrink-0 p-1 rounded-full transition-colors duration-300 ${openIndex === i ? "bg-brandRed text-white" : "bg-charcoal/5 text-charcoal"}`}>
                {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
              </div>
            </button>
            
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-5 pb-5 pt-0">
                    <p className="font-sans text-charcoal/70 leading-relaxed border-t border-charcoal/5 pt-4 text-base">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}