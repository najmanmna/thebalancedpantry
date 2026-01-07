"use client";
import React from "react";
import { Button } from "./ui/button";
import { HiMinus, HiPlus } from "react-icons/hi2";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/sanity.types";

interface Props {
  product: Product;
  itemKey: string;
  className?: string;
  borderStyle?: string;
  displayMode?: "default" | "overlay";
  availableStock?: number; // 🔹 optional prop to pass available stock
}

const QuantityButtons = ({
  product,
  itemKey,
  className,
  borderStyle,
  displayMode = "default",
}: Props) => {
  // ✅ Always get the latest cart item from store
  const cartItem = useCartStore((s) =>
    s.items.find((i) => i.itemKey === itemKey)
  );

  // quantity in cart
  const itemCount = cartItem?.quantity ?? 0;

  // Use Infinity as fallback until stock refresh completes
  const availableStock = cartItem?.variant?.availableStock ?? Infinity;

  const addItem = useCartStore((s) => s.addItem);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);

  const canIncrease = itemCount < availableStock;

  const handleAdd = () => {
    if (!cartItem) return; // safety
    if (!canIncrease) {
      toast.error("Cannot add more than available stock");
      return;
    }
    if (itemCount === 0) {
      addItem(product, cartItem.variant);
    } else {
      increaseQuantity(itemKey);
    }
    toast.success("Quantity increased successfully!");
  };

  const handleRemove = () => {
    if (itemCount <= 0) return;
    decreaseQuantity(itemKey);
    toast.success(
      itemCount > 1
        ? "Quantity decreased successfully!"
        : `${product?.name?.substring(0, 12)}${
            product?.name && product.name.length > 12 ? "..." : ""
          } removed!`
    );
  };

  const buttonClasses =
    displayMode === "overlay"
      ? "w-6 h-6 border-0 bg-black text-white hover:bg-black/80 hover:cursor-pointer"
      : "w-6 h-6 border-0 hover:bg-tech_orange/20 hover:cursor-pointer";

  const countClasses =
    displayMode === "overlay"
      ? "font-semibold text-sm w-6 text-center text-white"
      : "font-semibold text-sm w-6 text-center text-tech_dark";

  return (
    <div
      className={twMerge(
        "flex items-center gap-1 pb-1 text-base",
        borderStyle,
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={twMerge(buttonClasses)}
        onClick={handleRemove}
        disabled={itemCount === 0}
      >
        <HiMinus />
      </Button>

      <span className={countClasses}>{itemCount}</span>

      <Button
        variant="outline"
        size="icon"
        className={twMerge(buttonClasses)}
        onClick={handleAdd}
        disabled={!canIncrease}
      >
        <HiPlus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
