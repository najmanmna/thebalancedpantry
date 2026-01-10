"use client";

import React from "react";
import Link from "next/link";
import useCartStore from "@/store";
import { ShoppingBag } from "lucide-react"; // Updated to Lucide
import { motion } from "framer-motion";

interface CartMenuProps {
  color?: "black" | "white"; 
}

const CartMenu: React.FC<CartMenuProps> = ({ color = "black" }) => {
  const { items } = useCartStore();
  const cartCount = items.length;

  // Logic: In the new 'Cream' theme, the header is mostly light, so we default to Charcoal.
  // We keep the logic just in case you use this in a dark footer later.
  const iconColor = color === "white" ? "text-cream" : "text-charcoal";

  return (
    <motion.div
      className="relative z-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href="/cart">
        {/* Container matches the style of the Search button in Header.tsx */}
        <div className={`group relative p-2 rounded-full hover:bg-charcoal/5 transition-colors ${iconColor}`}>
          
          {/* The Icon */}
          <ShoppingBag className="w-5 h-5 group-hover:text-brandRed transition-colors" />

          {/* Retro Badge */}
          {cartCount > 0 && (
            <span
              className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm bg-brandRed text-cream group-hover:scale-110 transition-transform"
            >
              {cartCount}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CartMenu;