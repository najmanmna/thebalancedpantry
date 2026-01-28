"use client";

import React, { useEffect, useState } from "react";
import { payablePayment } from "payable-ipg-js";
import { Loader2 } from "lucide-react";

interface PayablePaymentProps {
  orderId: string;
  amount: string;
  hash: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerMobile: string;
  billingAddress: string;
  billingCity: string;
}

const PayablePaymentButton: React.FC<PayablePaymentProps> = ({
  orderId,
  amount,
  hash,
  customerFirstName,
  customerLastName,
  customerEmail,
  customerMobile,
  billingAddress,
  billingCity,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handlePayableMessage = async (event: MessageEvent) => {
      // Listen for success signal
      const isSuccess = 
        event.data === "COMPLETED" || 
        event.data === "SUCCESS" ||
        event.data?.status === "COMPLETED" ||
        event.data?.status === "SUCCESS";

      if (isSuccess) {
        console.log("✅ Payment Success Signal Received");
        
        // 1. Call Backend to update status & send emails
        try {
           await fetch("/api/payment-success", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ orderId }),
             keepalive: true,
           });
        } catch(e) { console.error("Update failed", e); }

        // 2. Redirect
        sessionStorage.setItem("orderPlaced", "true");
        const params = new URLSearchParams({
            orderNumber: orderId,
            total: amount,
            payment: "CARD"
        });
        window.location.href = `/success?${params.toString()}`;
      }
    };

    window.addEventListener("message", handlePayableMessage);
    return () => window.removeEventListener("message", handlePayableMessage);
  }, [orderId, amount]); 

  const handlePayment = () => {
    setIsLoading(true);
    
    // Clean inputs for Payable
    const cleanAddress = billingAddress.replace(/[^a-zA-Z0-9 ,.\-\/#]/g, " ").substring(0, 100);
    const cleanCity = billingCity.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
    const strictAmount = parseFloat(amount).toFixed(2);

    const paymentConfig = {
      merchantKey: process.env.NEXT_PUBLIC_PAYABLE_MERCHANT_KEY,
      invoiceId: orderId,
      amount: strictAmount,
      currencyCode: "LKR",
      checkValue: hash, // Hash from backend
      orderDescription: `Order ${orderId}`, 
      paymentType: "1", 
      logoUrl: "https://thebalancedpantry.lk/logo.png",
      customerFirstName,
      customerLastName,
      customerEmail,
      customerMobilePhone: customerMobile,
      billingAddressStreet: cleanAddress,
      billingAddressCity: cleanCity,
      billingAddressCountry: "LKA",
      // Optional: Set returnUrl if you want fallback redirection
      returnUrl: `${window.location.origin}/success?orderNumber=${orderId}&payment=CARD&total=${strictAmount}`, 
    };

    try {
       // false = Production, true = Sandbox
       // Change to false when going live!
       payablePayment(paymentConfig as any, true); 
    } catch (e) {
       console.error(e);
       setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full font-bold py-3 rounded-md transition duration-300 flex items-center justify-center gap-2
        ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
    >
      {isLoading ? <><Loader2 className="animate-spin" /> Processing...</> : "Pay Now (Card)"}
    </button>
  );
};

export default PayablePaymentButton;