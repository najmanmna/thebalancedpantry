"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react"; // Swapped AlignLeft for Menu
import Sidebar from "./Sidebar";
import { client } from "@/sanity/lib/client";
import type { Category } from "@/sanity.types";

// Keep the query efficient
const CATEGORY_QUERY = `*[_type == "category"]{
  _id,
  title,
  slug,
  image,
  "effectiveSortOrder": coalesce(sortOrder, 99999)
} | order(effectiveSortOrder asc)`;

interface MobileMenuProps {
  color?: "black" | "white";
}

const MobileMenu: React.FC<MobileMenuProps> = ({ color = "black" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  
  // Fetch logic remains same (efficient)
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const data = await client.fetch(CATEGORY_QUERY);
        if (mounted) setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  // Determine colors based on prop + theme
  const iconColor = color === "white" ? "text-cream" : "text-charcoal";

  return (
    <>
      {/* --- THE TRIGGER BUTTON --- */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-2 focus:outline-none"
        aria-label="Open Menu"
      >
        {/* 1. Icon Container (Matches Header Icons) */}
        <div className={`p-2 rounded-full transition-colors duration-300 ${color === "white" ? "hover:bg-white/10" : "hover:bg-charcoal/5"}`}>
          <Menu 
            className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} group-hover:text-brandRed transition-colors`} 
            strokeWidth={2}
          />
        </div>

        {/* 2. Text Label (Visible only on Desktop) */}
        {/* This makes it a "Universal" component you can drop anywhere */}
        <span className={`hidden lg:block text-sm font-sans font-bold transition-colors ${color === "white" ? "text-cream/90 group-hover:text-white" : "text-charcoal/80 group-hover:text-brandRed"}`}>
          Menu
        </span>
      </motion.button>

      {/* --- THE SIDEBAR (Portal/Modal) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            categories={categories ?? undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;