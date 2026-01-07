import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/sanity.types";
import type { SanityImage } from "@/types/sanity-helpers"; // Ensure this import exists if used
import toast from "react-hot-toast";

// 🔹 FIX: Extend the Sanity Product type locally to include your new fields
// This prevents TS errors even if you haven't regenerated sanity.types.ts yet.
export type ProductWithStock = Product & {
  openingStock?: number;
  stockOut?: number;
  sku?: string;
  images?: any[];
};

export interface CartItem {
  product: ProductWithStock; // Use the extended type here
  itemKey: string;
  quantity: number;
}

interface StoreState {
  items: CartItem[];
  addItem: (product: Product) => void;
  increaseQuantity: (itemKey: string) => void;
  decreaseQuantity: (itemKey: string) => void;
  deleteCartProduct: (itemKey: string) => void;
  resetCart: () => void;
  getItemCount: (itemKey: string) => number;
}

const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const itemKey = product._id;
          const existing = state.items.find((i) => i.itemKey === itemKey);
          
          // Cast to our extended type to access new fields safely
          const p = product as ProductWithStock;
          const opening = p.openingStock ?? 0;
          const out = p.stockOut ?? 0;
          const maxStock = opening - out;

          if (!existing) {
            if (maxStock <= 0) {
              toast.error("This product is out of stock");
              return state;
            }
            toast.success(`${product.name} added!`);
            // We cast `product` here so it fits the `items` array type
            return {
              items: [...state.items, { product: p, itemKey, quantity: 1 }],
            };
          }

          if (existing.quantity < maxStock) {
            toast.success(`${product.name} added!`);
            return {
              items: state.items.map((i) =>
                i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          } else {
            toast.error("Cannot add more than available stock");
            return state;
          }
        }),

      increaseQuantity: (itemKey) =>
        set((state) => {
          const item = state.items.find((i) => i.itemKey === itemKey);
          if (!item) return state;

          const p = item.product;
          const opening = p.openingStock ?? 0;
          const out = p.stockOut ?? 0;
          const maxStock = opening - out;

          if (item.quantity < maxStock) {
            return {
              items: state.items.map((i) =>
                i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          } else {
            toast.error("Cannot add more than available stock");
            return state;
          }
        }),

      decreaseQuantity: (itemKey) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.itemKey === itemKey
                ? { ...i, quantity: Math.max(0, i.quantity - 1) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      deleteCartProduct: (itemKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemKey !== itemKey),
        })),

      resetCart: () => set({ items: [] }),

      getItemCount: (itemKey: string) => {
        const item = get().items.find((i) => i.itemKey === itemKey);
        return item ? item.quantity : 0;
      },
    }),
    { name: "cart-store" }
  )
);

export default useCartStore;