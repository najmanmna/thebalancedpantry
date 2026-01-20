"use client";

import { Loader2, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { Input } from "../ui/input";
import { urlFor } from "@/sanity/lib/image";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  color?: "black" | "white";
}

const SearchBar: React.FC<SearchBarProps> = ({ color = "black" }) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Logic (Updated Query for your Schema)
  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      // 🔹 Updated to fetch 'mainImage' directly
      const query = `*[_type == "product" && isHidden != true && name match $search] | order(name asc) {
        _id,
        name,
        slug,
        price,
        mainImage 
      }[0...5]`; // Limit to 5 results for speed
      
      const params = { search: `${search}*` }; // Wildcard search
      const response = await client.fetch(query, params);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  // --- STYLES ---
  const isTransparentMode = color === "white";
  const triggerIconColor = isTransparentMode ? "text-white" : "text-charcoal";
  
  // Mobile Input Styles
  const mobileInputClass = isTransparentMode
    ? "bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50"
    : "bg-white border-charcoal/10 text-charcoal placeholder:text-charcoal/40 focus-visible:ring-brandRed/20";

  const mobileIconColor = isTransparentMode ? "text-white/80 hover:text-white" : "text-charcoal/60 hover:text-brandRed";

  return (
    <div ref={searchRef} className="relative z-50">
      
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden lg:block relative h-10 transition-all duration-300 ease-out" style={{ width: showSearch ? '300px' : '40px' }}>
        
        {/* Trigger Button */}
        {!showSearch && (
          <motion.button
            type="button"
            onClick={() => {
              setShowSearch(true);
              setShowResults(true);
            }}
            whileHover={{ scale: 1.1 }}
            className={`absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors ${triggerIconColor}`}
          >
            <Search className="w-5 h-5" />
          </motion.button>
        )}

        {/* Expanded Input */}
        {showSearch && (
          <motion.form
            initial={{ opacity: 0, width: 40 }}
            animate={{ opacity: 1, width: "100%" }}
            onSubmit={(e) => e.preventDefault()}
            className="absolute inset-0 flex items-center"
          >
            <Input
              ref={inputRef}
              placeholder="Search pantry..."
              className="w-full h-10 rounded-full bg-white text-charcoal pr-10 focus-visible:ring-2 focus-visible:ring-brandRed/20 border-charcoal/10 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowResults(true)}
            />
            <button
              type="button"
              onClick={() => {
                setShowResults(false);
                setShowSearch(false);
                setSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-charcoal/40 hover:text-brandRed" />
            </button>
          </motion.form>
        )}
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block lg:hidden w-full">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative flex items-center w-full"
        >
          <Input
            ref={inputRef}
            placeholder="Search..."
            className={`w-full h-10 rounded-full px-4 pr-10 ${mobileInputClass}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
             {search ? (
                <X 
                  onClick={() => { setShowResults(false); setSearch(""); }}
                  className={`w-4 h-4 cursor-pointer ${mobileIconColor}`} 
                />
             ) : (
                <Search className={`w-4 h-4 ${mobileIconColor}`} />
             )}
          </div>
        </form>
      </div>

      {/* --- RESULTS DROPDOWN --- */}
      <AnimatePresence>
        {showResults && (search.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-3 left-0 right-0 lg:-right-4 lg:left-auto lg:w-[350px] bg-white rounded-2xl shadow-xl z-[60] max-h-[70vh] overflow-y-auto border border-charcoal/5"
          >
            {loading ? (
              <div className="flex items-center justify-center px-6 py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-brandRed" />
                <span className="text-sm font-serif text-charcoal/60">Searching pantry...</span>
              </div>
            ) : products?.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30">Products</div>
                {products.map((product) => {
                  
                  // 🔹 Use mainImage from schema
                  const image = product.mainImage;

                  return (
                    <Link
                      key={product._id}
                      href={`/product/${product?.slug?.current}`}
                      onClick={() => {
                        setShowResults(false);
                        setShowSearch(false);
                        setSearch("");
                      }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-[#F9F7F2] transition-colors group border-b border-dashed border-gray-50 last:border-none"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 bg-[#F3EFE0] rounded-lg overflow-hidden flex-shrink-0 border border-charcoal/5">
                        {image ? (
                          <Image
                            width={48}
                            height={48}
                            src={urlFor(image).width(200).url()}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-charcoal/20 text-[8px]">No Img</div>
                        )}
                      </div>
                      
                      {/* Text Info */}
                      <div>
                        <h3 className="text-sm font-serif font-bold text-charcoal group-hover:text-brandRed transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="text-xs font-sans text-charcoal/50 mt-0.5">
                            LKR {product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-charcoal/50 font-serif italic">No treats found matching "{search}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;