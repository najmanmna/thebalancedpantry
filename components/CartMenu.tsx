"use client";

import React from "react";
import Link from "next/link";
import useCartStore from "@/store";
import { BsHandbag } from "react-icons/bs";
import { motion } from "framer-motion";

interface CartMenuProps {
  color?: "black" | "white"; // dynamic icon color
}

const CartMenu: React.FC<CartMenuProps> = ({ color = "black" }) => {
  const { items } = useCartStore();
  const cartCount = items.length;

  const iconColor = color === "white" ? "text-white" : "text-black";
  // const hoverShadow = color === "white"
  //   ? "0 0 12px rgba(255,255,255,0.35)"
  //   : "0 0 12px rgba(0,0,0,0.2)";

  return (
    <motion.div
      className="relative z-50"
      whileHover={{
        scale: 1.15,
        // boxShadow: hoverShadow,
      }}
    >
      <Link href="/cart">
        <div className={`p-3 hoverEffect relative ${iconColor}`}>
          <BsHandbag size={29} />
          {cartCount > 0 && (
  <span
    className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs
      ${color === "white" ? "bg-white text-black" : "bg-tech_dark text-white"}`}
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
