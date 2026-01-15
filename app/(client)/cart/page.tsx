"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2, ShoppingBag, ArrowLeft, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import useCartStore from "@/store";
import { sendGAEvent } from "@/lib/gtag";
import PriceFormatter from "@/components/PriceFormatter";
import QuantityButtons from "@/components/QuantityButtons";
import Loading from "@/components/Loading";

const CartPage = () => {
  const items = useCartStore((s) => s.items);
  const deleteCartProduct = useCartStore((s) => s.deleteCartProduct);
  const resetCart = useCartStore((s) => s.resetCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  const handleResetCart = () => {
    if (confirm("Clear your entire pantry selection?")) {
      resetCart();
      toast.success("Cart cleared");
    }
  };

  const handleDelete = (itemKey: string) => {
    deleteCartProduct(itemKey);
    toast.success("Removed from pantry");
  };

  // --- CHECKOUT LOGIC ---
  const handleProceedToCheckout = async () => {
    if (!items.length) return;
    setLoading(true);

    try {
      const productIds = items.map((i) => i.product._id);
      
      const query = `*[_type=="product" && _id in $ids]{
        _id,
        name,
        openingStock,
        stockOut
      }`;
      
      const freshProducts = await client.fetch(query, { ids: productIds }, { useCdn: false });
      let hasMismatch = false;

      for (const item of items) {
        const freshProduct = freshProducts.find((p: any) => p._id === item.product._id);
        
        if (!freshProduct) {
             toast.error(`Product "${item.product.name}" is no longer available.`);
             hasMismatch = true;
             continue;
        }

        const liveStock = (freshProduct.openingStock ?? 0) - (freshProduct.stockOut ?? 0);
        
        if (item.quantity > liveStock) {
          hasMismatch = true;
          toast.error(`${item.product.name}: Only ${liveStock} packs left.`);
        }
      }

      if (hasMismatch) {
        setLoading(false);
        return;
      }

      const cartTotal = items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
      sendGAEvent("begin_checkout", {
        currency: "LKR",
        value: cartTotal,
        items: items.map((item) => ({
          item_id: item.product._id,
          item_name: item.product.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      router.push("/checkout");
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  // --- CALCULATIONS ---
  const subtotal = items.reduce((t, it) => t + (it.price ?? 0) * it.quantity, 0);
  // Shipping is calculated at checkout based on address
  const total = subtotal; 

  return (
    <>
      {loading && <Loading />}
      
      <div className="bg-cream min-h-screen py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
                Your Selection
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-black text-charcoal mt-2">
                Your <span className="italic font-light">Pantry.</span>
              </h1>
            </div>
            <Link href="/shop" className="flex items-center gap-2 font-sans font-bold text-charcoal hover:text-brandRed transition-colors border-b border-transparent hover:border-brandRed pb-1">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* --- LEFT: CART ITEMS LIST --- */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence>
                  {items.map((item) => {
                    const imageRef = item.product.mainImage || item.product.images?.[0];
                    
                    return (
                      <motion.div 
                        key={item.itemKey}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white p-4 sm:p-6 rounded-[2rem] border border-charcoal/5 shadow-sm flex flex-col sm:flex-row gap-6 items-center"
                      >
                        {/* Image */}
                        <div className="relative w-full sm:w-32 aspect-square bg-[#F3EFE0] rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {imageRef ? (
                             <Image
                               src={urlFor(imageRef).url()}
                               alt={item.product.name}
                               fill
                               className="object-contain p-2"
                             />
                          ) : (
                             <PackageOpen className="w-8 h-8 text-charcoal/20" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center sm:text-left w-full">
                          <h3 className="font-serif text-xl font-bold text-charcoal leading-tight mb-1">
                            {item.product.name.split('(')[0]}
                          </h3>
                          
                          <div className="inline-block bg-charcoal/5 px-3 py-1 rounded-full mb-3">
                             <span className="font-sans text-xs font-bold text-charcoal/60 uppercase tracking-wide">
                               {item.bundleTitle || "Single Pack"}
                             </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 mt-2">
                             <div className="text-left">
                                <span className="block text-[10px] uppercase tracking-wider text-charcoal/40 font-bold">Price</span>
                                <PriceFormatter amount={item.price} className="font-sans font-medium text-charcoal" />
                             </div>
                             
                             <div className="text-left">
                                <span className="block text-[10px] uppercase tracking-wider text-charcoal/40 font-bold mb-1">Qty</span>
                                <QuantityButtons product={item.product} itemKey={item.itemKey} />
                             </div>
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 border-t sm:border-t-0 border-charcoal/5 pt-4 sm:pt-0">
                           <div className="text-right">
                              <span className="block text-[10px] uppercase tracking-wider text-charcoal/40 font-bold sm:hidden">Total</span>
                              <PriceFormatter amount={item.price * item.quantity} className="font-serif text-xl font-bold text-brandRed" />
                           </div>
                           
                           <button 
                             onClick={() => handleDelete(item.itemKey)}
                             className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal/40 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 transition-all"
                             title="Remove Item"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                <div className="text-center sm:text-left pt-2">
                   <button 
                     onClick={handleResetCart}
                     className="text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-red-500 transition-colors"
                   >
                     Empty Entire Pantry
                   </button>
                </div>
              </div>


              {/* --- RIGHT: ORDER SUMMARY --- */}
              <div className="lg:col-span-1 sticky top-24">
                <div className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brandRed/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <h2 className="font-serif text-2xl font-black text-charcoal mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-charcoal/70 font-sans text-sm">
                       <span>Subtotal</span>
                       <PriceFormatter amount={subtotal} />
                    </div>
                    
                    {/* Updated Shipping Logic */}
                    <div className="flex justify-between items-center text-charcoal/70 font-sans text-sm">
                       <span>Shipping</span>
                       <span className="text-xs font-bold uppercase tracking-wider text-charcoal/40">Calculated at Checkout</span>
                    </div>
                    
                    <div className="h-px bg-charcoal/10 my-2"></div>
                    
                    <div className="flex justify-between items-center text-charcoal font-bold text-lg">
                       <span className="font-serif">Estimated Total</span>
                       <PriceFormatter amount={total} className="text-brandRed" />
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    disabled={loading}
                    className="w-full bg-brandRed hover:bg-brandRed/90 text-cream font-serif font-bold text-lg h-14 rounded-2xl shadow-[4px_4px_0px_0px_#4A3728] hover:shadow-[2px_2px_0px_0px_#4A3728] hover:translate-y-[2px] transition-all"
                  >
                    {loading ? "Processing..." : "Secure Checkout"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-charcoal/40">
                     <ShoppingBag className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Secure Transaction</span>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-charcoal/5 text-center px-4">
               <div className="w-24 h-24 bg-[#F3EFE0] rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-charcoal/40" />
               </div>
               <h2 className="font-serif text-3xl font-bold text-charcoal mb-3">Your pantry is empty.</h2>
               <p className="font-sans text-charcoal/60 max-w-md mb-8">
                 It looks like you haven't discovered our crunchy goodness yet. 
                 Check out our latest drops.
               </p>
               <Link href="/shop">
                 <Button className="bg-brandRed text-cream font-serif font-bold px-8 py-6 rounded-full text-lg shadow-md hover:translate-y-[-2px] transition-transform">
                   Start Shopping
                 </Button>
               </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CartPage;