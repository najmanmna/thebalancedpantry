import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

// --- TYPES ---
export interface BundleOption {
  title: string;
  count: number;
  price: number;
  savings?: string;
  tag?: string;
}

export interface ProductWithStock {
  _id: string;
  name: string;
  price: number;
  mainImage?: any;
  openingStock?: number;
  stockOut?: number;
  slug?: { current: string };
  description?: string;
  sku?: string;
}

export interface CartItem {
  product: ProductWithStock;
  itemKey: string;      // Unique ID: "prod123-Single" vs "prod123-FamilyPack"
  quantity: number;     // How many OF THIS BUNDLE
  bundleCount: number;  // How many BASE UNITS inside this bundle (1, 3, 6)
  bundleTitle: string;  // "Single Pack", "The Stash"
  price: number;        // The price of this specific bundle
}

interface StoreState {
  items: CartItem[];
  addItem: (product: ProductWithStock, quantity: number, bundle?: BundleOption) => void;
  increaseQuantity: (itemKey: string) => void;
  decreaseQuantity: (itemKey: string) => void;
  deleteCartProduct: (itemKey: string) => void;
  resetCart: () => void;
  getItemCount: (itemKey: string) => number;
  getTotalBaseUnitsInCart: (productId: string) => number; // Helper to check global stock
}

const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],

      // --- HELPER: Count total base units of a product ID across all bundles ---
      getTotalBaseUnitsInCart: (productId: string) => {
        const { items } = get();
        return items
          .filter((item) => item.product._id === productId)
          .reduce((total, item) => total + (item.quantity * item.bundleCount), 0);
      },

      addItem: (product, quantity = 1, bundle) =>
        set((state) => {
          // 1. Determine Bundle Details
          const bundleCount = bundle?.count || 1;
          const bundleTitle = bundle?.title || "Single Pack";
          const bundlePrice = bundle?.price || product.price;

          // 2. Generate Unique Key (Product + Bundle Name)
          // This allows "Single Pack" and "6-Pack" to exist as separate lines
          const itemKey = `${product._id}-${bundleTitle.replace(/\s+/g, "-")}`;

          // 3. Stock Validation
          const opening = product.openingStock ?? 0;
          const out = product.stockOut ?? 0;
          const maxRealStock = opening - out;

          // Calculate how many base units are ALREADY in cart for this product
          const currentBaseUnits = get().getTotalBaseUnitsInCart(product._id);
          
          // Calculate how many we WANT to add
          const newBaseUnitsNeeded = quantity * bundleCount;

          if (currentBaseUnits + newBaseUnitsNeeded > maxRealStock) {
            toast.error(`Sorry, only ${maxRealStock} packs available in total.`);
            return state;
          }

          // 4. Add or Update Item
          const existingItem = state.items.find((i) => i.itemKey === itemKey);

          toast.success(`Added ${quantity} ${bundleTitle}${quantity > 1 ? 's' : ''}!`);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.itemKey === itemKey ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          } else {
            return {
              items: [
                ...state.items,
                {
                  product,
                  itemKey,
                  quantity,
                  bundleCount,
                  bundleTitle,
                  price: bundlePrice,
                },
              ],
            };
          }
        }),

      increaseQuantity: (itemKey) =>
        set((state) => {
          const item = state.items.find((i) => i.itemKey === itemKey);
          if (!item) return state;

          // Check Global Stock Again
          const maxRealStock = (item.product.openingStock ?? 0) - (item.product.stockOut ?? 0);
          const currentBaseUnits = get().getTotalBaseUnitsInCart(item.product._id);
          const requiredUnits = item.bundleCount; // Adding 1 more of this bundle

          if (currentBaseUnits + requiredUnits > maxRealStock) {
            toast.error("Cannot add more, stock limit reached.");
            return state;
          }

          return {
            items: state.items.map((i) =>
              i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }),

      decreaseQuantity: (itemKey) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.itemKey === itemKey ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      deleteCartProduct: (itemKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemKey !== itemKey),
        })),

      resetCart: () => set({ items: [] }),

      getItemCount: (itemKey) => {
        const item = get().items.find((i) => i.itemKey === itemKey);
        return item ? item.quantity : 0;
      },
    }),
    { name: "balanced-pantry-cart" }
  )
);

export default useCartStore;