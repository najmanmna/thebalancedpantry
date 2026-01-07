"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LogoBlack from "../LogoBlack";
import LogoWhite from "../LogoWhite";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import CartMenu from "../CartMenu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // 1. FIX: Treat "/index" as Homepage too
  const isHome = pathname === "/" || pathname === "/index";

  // Logic: "Dark Mode" (White BG) if scrolled OR not on homepage
  const useBlackTheme = isScrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    // 2. FIX: Run this immediately on load to check current position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        useBlackTheme
          ? "bg-white text-black shadow-md pt-6 sm:py-6" 
          : "bg-transparent text-white py-6"
      }`}
    >
      <div className="relative flex items-center justify-between px-4 sm:px-10 mb-2 md:mb-0">
        
        {/* Left - Menu */}
        <div className="flex items-center">
          <MobileMenu color={useBlackTheme ? "black" : "white"} /> 
        </div>

        {/* Center - Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {useBlackTheme ? <LogoBlack /> : <LogoWhite />}
        </div>

        {/* Right - Cart + Search (Desktop) */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar color={useBlackTheme ? "black" : "white"} />
          </div>
          <div>
            <CartMenu color={useBlackTheme ? "black" : "white"} />
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="block md:hidden px-4 pb-2">
        <SearchBar color={useBlackTheme ? "black" : "white"} />
      </div>
    </header>
  );
};

export default Header;