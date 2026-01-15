"use client";

import useCartStore from "@/store";
import { cn } from "@/lib/utils";
import { ShoppingCart, Check } from "lucide-react";

interface Props {
  product: any;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useCartStore();
  
  // Default to "Single Pack" Logic for Quick Add
  const itemKey = `${product._id}-Single-Pack`; 
  const itemCount = getItemCount(itemKey);

  // Simple stock check for grid view (only checks raw number, not bundle math)
  const availableStock = (product.openingStock || 0) - (product.stockOut || 0);
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link click if inside a card
    if (isOutOfStock) return;
    
    // Quick Add = 1 Unit, Single Pack
    addItem(product, 1); 
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={cn(
        "w-full h-10 bg-brandRed text-cream text-sm font-bold uppercase tracking-wider hover:bg-brandRed/90 transition-colors flex items-center justify-center rounded-lg shadow-sm gap-2",
        isOutOfStock && "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400",
        className
      )}
    >
      {itemCount > 0 ? (
        <>
          <Check size={16} /> Added ({itemCount})
        </>
      ) : (
        <>
          <ShoppingCart size={16} /> {isOutOfStock ? "Out of Stock" : "Add"}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;