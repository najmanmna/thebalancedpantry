"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";

// Components
import LogoBlack from "../LogoBlack";
import MobileMenu from "./MobileMenu";
import CartMenu from "../CartMenu"; 
import SearchBar from "./SearchBar"; // 👈 Integrated SearchBar

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
        <div className="flex-1 flex justify-start items-center gap-4 sm:gap-6">
          
          {/* 1. Mobile Menu (Handles Sidebar + "Menu" text) */}
          <MobileMenu color="black" />

          {/* 2. Track Order Link (Hidden on small mobile) */}
          {/* <Link 
            href="/orders" 
            className="hidden lg:flex items-center gap-2 group"
          >
             <div className="p-2 rounded-full hover:bg-charcoal/5 transition-colors">
               <Truck className="w-5 h-5 text-charcoal group-hover:text-brandRed transition-colors" />
             </div>
             <span className="text-sm font-sans font-bold text-charcoal/80 group-hover:text-brandRed transition-colors">
               Track Order
             </span>
          </Link> */}
        </div>

        {/* --- CENTER SECTION: Logo --- */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`transition-transform duration-300 ${isScrolled ? "scale-90" : "scale-100"}`}>
               <LogoBlack />
            </div>
        </div>

        {/* --- RIGHT SECTION: Actions --- */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
          
          {/* 1. Search Bar (Integrated) */}
          {/* Note: The SearchBar handles its own width/responsiveness */}
          <div className=" items-center hidden md:flex">
            <SearchBar color="black" />
          </div>

          {/* 2. Cart Menu */}
          <CartMenu color="black" />

          {/* 3. Order Button (Retro Style) */}
          <Link href="/shop" className="hidden md:block">
            <button
              className="ml-2 bg-brandRed text-cream font-serif font-bold text-sm px-6 py-2.5 rounded-full shadow-[3px_3px_0px_0px_rgba(74,55,40,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(74,55,40,1)] hover:bg-brandRed/90 transition-all duration-200 border border-charcoal/10"
            >
              Order Now
            </button>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;