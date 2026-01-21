"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, ArrowUpRight } from "lucide-react";
// Use your White Logo here since the background is dark
import LogoWhite from "../LogoBlack"; 

export default function Footer() {
  return (
    <footer className="bg-[#4A3728] text-[#F3EFE0] pt-20 pb-10 relative overflow-hidden">
      
      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-[#F3EFE0]/10 pb-16">
          
          {/* Column 1: Brand (Span 4) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="scale-110 origin-left brightness-0 invert">
               <LogoWhite />
            </div>
            <p className="font-sans text-[#F3EFE0]/60 leading-relaxed max-w-sm">
              Snacking shouldn’t be a sin.
              We bring you wholesome, low-calorie products made with honest, nourishing ingredients to Sri Lanka.
            </p>
            <div className="flex gap-4">
              <SocialBtn icon={Instagram} href="#" />
              <SocialBtn icon={Facebook} href="#" />
              <SocialBtn icon={Twitter} href="#" />
            </div>
          </div>

          {/* Column 2: Shop (Span 2) */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-serif font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-4 font-sans text-[#F3EFE0]/60 text-sm">
              <li><Link href="/shop" className="hover:text-brandRed transition-colors">Strawberries</Link></li>
              <li><Link href="#" className="hover:text-brandRed transition-colors">Durian (Coming Soon)</Link></li>
            </ul>
          </div>

          {/* Column 3: Company (Span 2) */}
          <div className="md:col-span-2">
            <h4 className="font-serif font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 font-sans text-[#F3EFE0]/60 text-sm">
              <li><Link href="/science" className="hover:text-brandRed transition-colors">The Science</Link></li>
              <li><Link href="/contact" className="hover:text-brandRed transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter (Span 3) */}
          <div className="md:col-span-3">
            <h4 className="font-serif font-bold text-lg mb-4">Stay Crunchy</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-[#F3EFE0]/5 border border-[#F3EFE0]/10 rounded-lg px-4 py-3 text-sm text-[#F3EFE0] placeholder:text-[#F3EFE0]/20 focus:outline-none focus:border-brandRed w-full"
              />
              <button className="bg-brandRed text-[#F3EFE0] p-3 rounded-lg hover:bg-brandRed/90 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-[#F3EFE0]/40">
          
          {/* Copyright & Credits */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <p>© 2026 The Balanced Pantry. All rights reserved.</p>
            <span className="hidden md:inline-block opacity-20">|</span>
            <p>
              Designed & Developed by{" "}
              <a 
                href="https://ahamedwebstudio.com" // 👈 Add your URL here
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#F3EFE0] transition-colors font-semibold"
              >
                Ahamed Web Studio
              </a>
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#F3EFE0]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#F3EFE0]">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

function SocialBtn({ icon: Icon, href }: { icon: any, href: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full border border-[#F3EFE0]/10 flex items-center justify-center hover:bg-brandRed hover:border-brandRed hover:text-white transition-all text-[#F3EFE0]/60"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}