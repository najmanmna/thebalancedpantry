"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/lib/client";
import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import NoProductAvailable from "./NoProductAvailable";

const AllProductsGrid = () => {
  // Using any[] temporarily since sanity.types.ts might not be regenerated yet
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 UPDATED QUERY: Simplified for non-variant schema
  const query = `*[_type == "product" && isHidden != true] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    status, // e.g., "new", "hot"
    
    // Stock Logic
    openingStock,
    stockOut,
    "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),

    // Images
    images[] {
      asset
    },

    // Categories
    "categories": categories[]->title
  }`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await client.fetch(query);
        setProducts(response);
      } catch (error) {
        console.error("Error fetching all products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full mt-10">
        <motion.div className="flex items-center space-x-2 text-black">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading all products...</span>
        </motion.div>
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return <NoProductAvailable />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
      {products.map((product) => (
        <AnimatePresence key={product._id}>
          <motion.div
            layout
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProductCard product={product} />
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
};

export default AllProductsGrid;