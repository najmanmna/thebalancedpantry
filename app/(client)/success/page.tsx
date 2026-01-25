"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Home, ShoppingBag, Copy, ArrowRight, PackageCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import useCartStore from "@/store";
import { sendGAEvent } from "@/lib/gtag";
import PriceFormatter from "@/components/PriceFormatter";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderNumber = searchParams.get("orderNumber");
  const paymentMethod = searchParams.get("payment") || "Cash on Delivery";
  const total = parseFloat(searchParams.get("total") || "0");

  const resetCart = useCartStore((state) => state.resetCart);
  const [validAccess, setValidAccess] = useState(false);
  
  // ✅ Prevent double-firing analytics
  const eventFired = useRef(false);

  useEffect(() => {
    const placed = sessionStorage.getItem("orderPlaced");
    if (!orderNumber || !placed) {
      router.replace("/");
      return;
    }

    setValidAccess(true);
    resetCart();

    const handleUnload = () => {
      sessionStorage.removeItem("orderPlaced");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [orderNumber, router, resetCart]);

  // 🔥 GA4 TRACKING
  useEffect(() => {
    if (validAccess && orderNumber && total && !eventFired.current) {
      sendGAEvent("purchase", {
        transaction_id: orderNumber,
        value: total,
        currency: "LKR",
        payment_type: paymentMethod,
      });
      eventFired.current = true;
    }
  }, [validAccess, orderNumber, total, paymentMethod]);

  if (!validAccess) return null;

  const bankDetails = `F A Uwais
005212035096
Nations Trust Bank Wellawatte Branch`;

  const copyBankDetails = async () => {
    await navigator.clipboard.writeText(bankDetails);
    toast.success("Bank details copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* RECEIPT CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-charcoal/5 relative">
          
          {/* Top Decorative Pattern */}
          <div className="h-3 bg-repeat-x opacity-20" style={{ backgroundImage: "linear-gradient(135deg, #D64545 25%, transparent 25%), linear-gradient(225deg, #D64545 25%, transparent 25%)", backgroundSize: "20px 20px" }}></div>

          <div className="p-8 sm:p-12 text-center">
            
            {/* Success Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-sm"
            >
              <Check strokeWidth={4} className="w-10 h-10" />
            </motion.div>

            <h1 className="font-serif text-4xl sm:text-5xl font-black text-charcoal mb-4 leading-tight">
              Order Confirmed!
            </h1>
            <p className="font-sans text-charcoal/60 text-lg max-w-md mx-auto leading-relaxed">
              Your pantry is being restocked. We’ve sent a confirmation email with your details.
            </p>

            {/* Order Details Box */}
            <div className="mt-10 bg-cream/50 rounded-3xl p-8 border border-charcoal/5 text-left">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  
                  <div>
                     <span className="block text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Order Number</span>
                     <span className="font-serif text-xl font-bold text-charcoal">#{orderNumber}</span>
                  </div>

                  <div>
                     <span className="block text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Total Amount</span>
                     <PriceFormatter amount={total} className="font-serif text-xl font-bold text-brandRed" />
                  </div>

                  <div>
                     <span className="block text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Payment Method</span>
                     <span className="font-sans text-sm font-bold text-charcoal">{paymentMethod}</span>
                  </div>

                  <div>
                     <span className="block text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Estimated Delivery</span>
                     <span className="font-sans text-sm font-bold text-charcoal">3-5 Working Days</span>
                  </div>

               </div>
            </div>

            {/* Bank Transfer Section (Conditional) */}
            {paymentMethod.toLowerCase().includes("bank") && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-yellow-50 rounded-2xl p-6 border border-yellow-100 text-left"
              >
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-white rounded-full text-yellow-600 shadow-sm">
                      <ArrowRight className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-serif font-bold text-charcoal text-lg mb-2">Complete Your Transfer</h3>
                      <p className="text-sm text-charcoal/70 mb-4 leading-relaxed">
                        Please transfer <strong className="text-charcoal">Rs. {total.toLocaleString()}</strong> to the account below. 
                        Use Order <strong className="text-charcoal">#{orderNumber}</strong> as the reference.
                      </p>
                      
                      <div className="bg-white rounded-xl p-4 border border-charcoal/5 flex items-center justify-between group cursor-pointer hover:border-brandRed/20 transition-colors" onClick={copyBankDetails}>
                         <pre className="font-mono text-xs sm:text-sm text-charcoal/80 whitespace-pre-wrap">{bankDetails}</pre>
                         <Copy className="w-4 h-4 text-charcoal/40 group-hover:text-brandRed transition-colors" />
                      </div>
                      <p className="text-[10px] text-center mt-2 text-charcoal/40">Click to copy details</p>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/shop">
                  <button className="w-full sm:w-auto px-8 py-4 bg-charcoal text-white rounded-xl font-serif font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                     <ShoppingBag className="w-5 h-5" /> Continue Shopping
                  </button>
               </Link>
               <Link href="/">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white text-charcoal border border-charcoal/10 rounded-xl font-sans font-bold text-sm hover:bg-cream transition-colors flex items-center justify-center gap-2">
                     <Home className="w-4 h-4" /> Back Home
                  </button>
               </Link>
            </div>

          </div>

          {/* Bottom Receipt Edge */}
          <div className="h-4 bg-white relative">
             <div className="absolute w-full h-full" style={{ 
                background: "linear-gradient(45deg, transparent 33.333%, #F3EFE0 33.333%, #F3EFE0 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #F3EFE0 33.333%, #F3EFE0 66.667%, transparent 66.667%)",
                backgroundSize: "20px 40px",
                backgroundPosition: "0 100%"
             }}></div>
          </div>

        </div>
        
        {/* Trust Footer */}
        <p className="text-center mt-8 text-charcoal/40 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
           <PackageCheck className="w-4 h-4" />
           Verified Purchase
        </p>

      </motion.div>
    </div>
  );
};

export default SuccessPage;