"use client";

import { Product } from "@/sanity.types";
import PriceFormatter from "./PriceFormatter";
import useCartStore from "@/store";
import QuantityButtons from "./QuantityButtons";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { sendGAEvent } from "@/lib/gtag";

interface Props {
  product: Product;
  className?: string;
  // We keep the prop name 'variant' for compatibility with ProductClient,
  // but it now only needs to carry the stock number.
  variant?: { availableStock: number }; 
  displayMode?: "default" | "overlay";
}

const AddToCartButton = ({
  product,
  className,
  variant,
  displayMode = "default",
}: Props) => {
  const { addItem, getItemCount } = useCartStore();

  // 🔹 SIMPLIFIED: Item Key is just the Product ID (no variant keys)
  const itemKey = product._id;
  const itemCount = getItemCount(itemKey);

  // Get stock from the passed prop (calculated in parent) or fallback
  const stockAvailable = variant?.availableStock ?? 0;
  const isOutOfStock = stockAvailable === 0;

  const handleAddToCart = () => {
    // 🔹 SIMPLIFIED: Add item without variant details
    addItem(product);

    sendGAEvent("add_to_cart", {
      currency: "LKR",
      value: product.price,
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
          // variant: removed (not applicable in simplified mode)
        },
      ],
    });
  };

  const textColor =
    displayMode === "overlay" ? "text-white" : "text-tech_dark/80";
  const amountColor =
    displayMode === "overlay" ? "text-white" : "text-tech_dark";

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className={cn("text-sm w-full", textColor)}>
          <div className="flex items-center justify-between">
            <span className="text-xs">Quantity</span>
            <QuantityButtons
              itemKey={itemKey}
              product={product}
              displayMode={displayMode}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
              className={amountColor}
            />
          </div>
        </div>
      ) : (
        <button
          className={cn(
            "w-full py-2 px-4 bg-tech_orange text-white text-center hover:bg-tech_orange/90 transition-colors flex items-center justify-center rounded",
            isOutOfStock && "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400",
            className
          )}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart size={16} className="mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;