"use client";

import { X, ChevronRight, Instagram, Facebook, Mail } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOutsideClick } from "@/hooks"; // Assuming this hook exists in your project
import LogoBlack from "../LogoBlack"; // Using the Dark logo for the Cream background
import { Category } from "@/sanity.types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories }) => {
  const pathname = usePathname();
  // We use the hook to detect clicks outside the sidebar panel
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);

  // --- Animation Variants ---
  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const panelVariants = {
    closed: { x: "-100%" },
    open: { 
      x: "0%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
  };

  const linkVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.1 + i * 0.05, duration: 0.3 }
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. BACKDROP (Dark overlay) */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-sm"
          />

          {/* 2. SIDEBAR PANEL */}
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className="fixed inset-y-0 left-0 z-50 w-[85vw] sm:w-[350px] bg-cream border-r border-charcoal/10 shadow-2xl flex flex-col h-full"
          >
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between p-6 border-b border-charcoal/5">
              <div className="scale-90 origin-left">
                 <LogoBlack />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-10">
              
              {/* SECTION A: SHOP (Dynamic Categories) */}
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-4">
                  Shop
                </h3>
                <div className="flex flex-col gap-3">
                  {categories && categories.length > 0 ? (
                    categories.map((cat, i) => (
                      <motion.div
                        key={cat._id}
                        custom={i}
                        variants={linkVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href={`/category/${cat.slug?.current}`}
                          onClick={onClose}
                          className={`group flex items-center justify-between font-serif text-2xl font-bold transition-all ${
                            pathname === `/category/${cat.slug?.current}`
                              ? "text-brandRed"
                              : "text-charcoal hover:text-brandRed"
                          }`}
                        >
                          {cat.title}
                          {/* Animated Arrow on Hover */}
                          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brandRed" />
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-charcoal/50 italic text-sm">Loading pantry...</p>
                  )}
                </div>
              </div>

              {/* SECTION B: DISCOVER (Static Links) */}
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-4">
                  Discover
                </h3>
                <div className="flex flex-col gap-4 font-sans font-semibold text-lg text-charcoal/80">
                  <Link href="/our-story" onClick={onClose} className="hover:text-brandRed transition-colors">
                    Our Story
                  </Link>
                 
                  <Link href="/faq" onClick={onClose} className="hover:text-brandRed transition-colors">
                    FAQ
                  </Link>
                </div>
              </div>

            </div>

            {/* --- FOOTER --- */}
            <div className="p-6 border-t border-charcoal/5 bg-charcoal/5">
              <div className="flex gap-4 mb-4">
                <SocialIcon Icon={Instagram} />
                <SocialIcon Icon={Facebook} />
                <SocialIcon Icon={Mail} />
              </div>
              <p className="text-xs text-charcoal/50 font-sans">
                © 2026 The Balanced Pantry. <br />
                Made with nature in mind.
              </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Simple helper for social icons
const SocialIcon = ({ Icon }: { Icon: any }) => (
  <a href="#" className="p-2 bg-white rounded-full text-charcoal hover:bg-brandRed hover:text-white transition-all shadow-sm">
    <Icon className="w-4 h-4" />
  </a>
);

export default Sidebar;