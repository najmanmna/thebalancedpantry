"use client";
import { Loader2, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { Input } from "../ui/input";
import { urlFor } from "@/sanity/lib/image";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface SearchBarProps {
  color?: "black" | "white";
}

const SearchBar: React.FC<SearchBarProps> = ({ color = "black" }) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
     const query = `*[_type == "product" && isHidden != true && name match $search] | order(name asc) {
  _id,
  name,
  slug,
  price,
  "images": variants[0].images // 👈 This makes product.images work!
}`;
      const params = { search: `${search}*` };
      const response = await client.fetch(query, params);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  // --- 🎨 DYNAMIC STYLES ---
  const isTransparentMode = color === "white";

  // Desktop Icons
  const triggerIconColor = isTransparentMode ? "text-white" : "text-black";
  
  // Mobile Input Styles (The Fix)
  // If transparent mode: Use Glassmorphism (Blurry transparent white)
  // If normal mode: Use standard white/gray background
  const mobileInputClass = isTransparentMode
    ? "bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50"
    : "bg-white border-gray-200 text-black placeholder:text-gray-400 focus-visible:ring-black/10";

  const mobileIconColor = isTransparentMode ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-black";

  return (
    <div ref={searchRef} className="relative">
      
      {/* --- DESKTOP VIEW (Unchanged) --- */}
      <div className="hidden lg:block relative w-40 h-10 lg:w-[340px]">
        {!showSearch && (
          <motion.button
            type="button"
            onClick={() => {
              setShowSearch(true);
              setShowResults(true);
            }}
            whileHover={{ scale: 1.1 }}
            className={`absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center ${triggerIconColor}`}
          >
            <Search className="w-8 h-8" />
          </motion.button>
        )}

        {showSearch && (
          <form
            onSubmit={(e) => e.preventDefault()}
            className="absolute inset-0 flex items-center"
          >
            <Input
              ref={inputRef}
              placeholder="Search..."
              className="flex-1 h-10 rounded-full bg-white text-black pr-10 focus-visible:ring-2 focus-visible:ring-orange-500 border-none shadow-md"
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
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-black cursor-pointer" />
            </button>
          </form>
        )}
      </div>

      {/* --- MOBILE VIEW (Updated) --- */}
      <div className="block lg:hidden mt-5 w-full">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative flex items-center w-full"
        >
          <Input
            ref={inputRef}
            placeholder="Search products..."
            // 👈 This class now adapts to the header color
            className={`w-full h-10 rounded-lg border focus-visible:ring-1 pr-10 transition-colors duration-300 ${mobileInputClass}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
             {search ? (
                <X 
                  onClick={() => { setShowResults(false); setSearch(""); }}
                  className={`w-5 h-5 cursor-pointer ${mobileIconColor}`} 
                />
             ) : (
                <Search className={`w-5 h-5 ${mobileIconColor}`} />
             )}
          </div>
        </form>
      </div>

      {/* --- RESULTS DROPDOWN --- */}
      {showResults && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl z-[60] max-h-[70vh] overflow-y-auto border border-gray-100 ring-1 ring-black/5">
          {loading ? (
            <div className="flex items-center justify-center px-6 py-6 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <span className="text-sm font-medium text-gray-500">Searching...</span>
            </div>
          ) : products?.length > 0 ? (
     <div className="py-2">
              {products.map((product) => {
                
                // 👇 1. PASTE THE LINE HERE (Inside the map loop)
                const productImage = product?.variants?.[0]?.images?.[0] || product?.images?.[0];

                // 👇 2. Add the 'return' keyword
                return (
                  <Link
                    key={product?._id}
                    href={`/product/${product?.slug?.current}`}
                    onClick={() => {
                      setShowResults(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                      
                      {/* 👇 3. Update the check to use 'productImage' */}
                      {productImage && (
                        <Image
                          width={48}
                          height={48}
                          src={urlFor(productImage).width(200).url()}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-black-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      {product.price && (
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">
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
              {search ? (
                <>
                  <p className="text-sm text-gray-500">No results found</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Type to search...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;