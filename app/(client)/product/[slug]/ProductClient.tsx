"use client";

import React, { useState, useEffect } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import ImageView from "@/components/ImageView";
import PriceView from "@/components/PriceView";
import toast from "react-hot-toast";
import Container from "@/components/Container";
import { useRouter } from "next/navigation";
import useCartStore from "@/store";
import Loading from "@/components/Loading";
import { sendGAEvent } from "@/lib/gtag";

export default function ProductClient({ product }: { product: any }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const [buying, setBuying] = useState(false);

  // --- 1. STOCK CALCULATION ---
  const openingStock = product?.openingStock ?? 0;
  const stockOut = product?.stockOut ?? 0;
  const availableStock = openingStock - stockOut; // Calculate real stock
  
  const isOutOfStock = availableStock <= 0;
  const images = product?.images ?? [];
  const itemKey = product._id; 

  const handleBuyNow = async () => {
    if (buying) return;
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    setBuying(true);

    try {
      const existsInCart = cartItems.find((item) => item.itemKey === itemKey);
      
      if (!existsInCart) {
        // Pass the calculated stock to the store if needed
        addItem({ ...product, stock: availableStock }); 
      }

      sendGAEvent("add_to_cart", {
        currency: "LKR",
        value: product.price,
        items: [{ item_id: product._id, item_name: product.name, price: product.price, quantity: 1 }],
      });

      setTimeout(() => {
        router.push("/cart");
      }, 100);
    } finally {
      // Stay loading until nav
    }
  };

  // ... (Keep your useEffects for global info and GA4 tracking here) ...

  return (
    <>
      {buying && <Loading />}
      <div className="bg-tech_white py-12">
        <Container>
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Image View */}
            {images.length > 0 && (
              <ImageView
                images={images}
                isStock={availableStock} // Pass calculated stock
                isPreOrder={false} 
              />
            )}

            {/* Info */}
            <div className="w-full md:w-3/5 flex flex-col gap-5">
              <div className="space-y-2">
                <p
                  className={`w-24 text-center text-xs py-1 font-semibold rounded-lg ${
                    !isOutOfStock
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {!isOutOfStock ? "In Stock" : "Out of Stock"}
                </p>
                <h1 className="text-3xl font-bold">{product?.name}</h1>
              </div>

              <PriceView price={product?.price} discount={0} className="text-xl font-bold" />

              <div className="text-sm text-gray-600 space-y-1">
                {product?.sku && <p>SKU: {product.sku}</p>}
                <p>Delivery Time: 3-5 Working Days</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-1/2 mt-4">
                <AddToCartButton
                  key={itemKey}
                  product={product}
                  // Pass calculated stock to button so it knows when to disable
                  variant={{ availableStock: availableStock }} 
                />
                
                <button
                  onClick={handleBuyNow}
                  disabled={buying || isOutOfStock}
                  className={`w-36 text-white py-2 transition rounded font-semibold
                    ${buying || isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-black"}`}
                >
                  {buying ? "Processing..." : "BUY NOW"}
                </button>
              </div>

              {product?.description && (
                <div className="border-t border-gray-300 pt-6 mt-4">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}