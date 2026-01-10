"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Menu, Truck } from "lucide-react";

// Components
import LogoBlack from "../LogoBlack";
import MobileMenu from "./MobileMenu";
import CartMenu from "../CartMenu"; // This now uses your new Retro CartMenu

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-cream/90 backdrop-blur-md py-3 border-b border-charcoal/5 shadow-sm"
          : "bg-cream py-5 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between relative">
        
        {/* --- LEFT SECTION: Menu & Trust --- */}
 {/* --- LEFT SECTION --- */}
<div className="flex-1 flex justify-start items-center gap-6">
  
  {/* The MobileMenu handles both Mobile Icon AND Desktop "Menu" text */}
  <MobileMenu color="black" />

  {/* Track Order Link... */}
</div>

        {/* --- CENTER SECTION: Logo --- */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="block">
            <div className={`transition-transform duration-300 ${isScrolled ? "scale-90" : "scale-100"}`}>
               <LogoBlack />
            </div>
          </Link>
        </div>

        {/* --- RIGHT SECTION: Actions --- */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
          
          {/* 1. Search Icon */}
          <button className="p-2 text-charcoal hover:text-brandRed transition-colors hover:bg-charcoal/5 rounded-full">
            <Search className="w-5 h-5" />
          </button>

          {/* 2. CART MENU (Integrated) */}
          {/* This uses the modified CartMenu.tsx you just updated */}
          <CartMenu color="black" />

          {/* 3. Order Button (Retro Style) */}
          <button
            className="hidden md:block ml-2 bg-brandRed text-cream font-serif font-bold text-sm px-6 py-2.5 rounded-full shadow-[3px_3px_0px_0px_rgba(74,55,40,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(74,55,40,1)] transition-all duration-200 border border-charcoal/10"
          >
            Order Now
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;