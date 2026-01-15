"use client";

import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { cn } from "@/lib/utils";
import type { Product } from "@/sanity.types";

interface Props {
  product: any; // Using the extended product type with stock fields
  itemKey: string;
  className?: string;
  displayMode?: "default" | "minimal"; // 'minimal' for tight spaces like grids
}

const QuantityButtons = ({
  product,
  itemKey,
  className,
  displayMode = "default",
}: Props) => {
  const { items, increaseQuantity, decreaseQuantity, deleteCartProduct, getTotalBaseUnitsInCart } = useCartStore();

  // 1. Get the specific line item (e.g., "Strawberries (3-Pack)")
  const cartItem = items.find((i) => i.itemKey === itemKey);
  const itemCount = cartItem?.quantity ?? 0;
  const bundleCount = cartItem?.bundleCount ?? 1; // Default to 1 if missing

  // 2. Stock Calculation
  // We need to check if adding ONE more of this bundle would exceed the GLOBAL base unit stock
  const openingStock = product?.openingStock ?? 0;
  const stockOut = product?.stockOut ?? 0;
  const maxRealStock = openingStock - stockOut;
  
  // How many base units of this product are currently in the cart (across all bundles)?
  // We use a fallback calculation if the store helper isn't available immediately
  const currentTotalBaseUnits = items
    .filter((i) => i.product._id === product._id)
    .reduce((total, i) => total + (i.quantity * (i.bundleCount || 1)), 0);

  const canIncrease = (currentTotalBaseUnits + bundleCount) <= maxRealStock;

  // --- HANDLERS ---
  const handleAdd = () => {
    if (!canIncrease) {
      toast.error(`Max stock reached for ${product.name}`);
      return;
    }
    increaseQuantity(itemKey);
  };

  const handleRemove = () => {
    if (itemCount > 1) {
      decreaseQuantity(itemKey);
    } else {
      deleteCartProduct(itemKey);
      toast.success("Removed from pantry");
    }
  };

  // --- STYLES ---
  // "Default" = The Pill Shape (Cart Page)
  // "Minimal" = Smaller, transparent (Grid View)
  const isMinimal = displayMode === "minimal";

  return (
    <div
      className={cn(
        "flex items-center justify-between transition-all",
        isMinimal 
          ? "gap-2" 
          : "gap-4 bg-white px-3 py-2 rounded-full border border-charcoal/10 shadow-sm w-fit",
        className
      )}
    >
      <button
        onClick={handleRemove}
        className={cn(
          "flex items-center justify-center transition-colors rounded-full",
          isMinimal 
            ? "w-6 h-6 bg-charcoal/5 hover:bg-red-100 hover:text-red-500" 
            : "w-6 h-6 hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal"
        )}
      >
        {itemCount === 1 ? (
          <Trash2 className="w-3.5 h-3.5" />
        ) : (
          <Minus className="w-3.5 h-3.5" />
        )}
      </button>

      <span className={cn(
        "font-serif font-bold text-charcoal select-none tabular-nums text-center",
        isMinimal ? "text-sm min-w-[1.2rem]" : "text-base min-w-[1.5rem]"
      )}>
        {itemCount}
      </span>

      <button
        onClick={handleAdd}
        disabled={!canIncrease}
        className={cn(
          "flex items-center justify-center transition-colors rounded-full",
          isMinimal 
            ? "w-6 h-6 bg-charcoal/5 hover:bg-brandRed/10 hover:text-brandRed" 
            : "w-6 h-6 hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal",
          !canIncrease && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-charcoal/60"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QuantityButtons;