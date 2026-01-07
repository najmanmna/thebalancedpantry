// components/WhatsAppButton.tsx
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Prod = { name?: string | null; slug?: string | null } | null;

export default function WhatsAppButton({ product }: { product?: Prod }) {
  const [prodState, setProdState] = useState<Prod>(product ?? null);
  const [origin, setOrigin] = useState<string>("");

  // set origin safely on client
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  // Prefer prop product when passed; otherwise listen for global updates
  useEffect(() => {
    if (product) {
      setProdState(product);
      return;
    }

    // read any existing global product info
    const globalInfo = (window as any).__PRODUCT_INFO ?? null;
    setProdState(globalInfo);

    // handler to pick up updates
    const handler = () => {
      setProdState((window as any).__PRODUCT_INFO ?? null);
    };

    window.addEventListener("productInfo", handler);
    return () => window.removeEventListener("productInfo", handler);
  }, [product]);

  const phone = "94775507940";

  const message = useMemo(() => {
    if (prodState?.name && prodState?.slug && origin) {
      return `Hi, I'm interested in your product: ${prodState.name}\nCheck it here: ${origin}/product/${prodState.slug}`;
    }
    return "Hi, I want to know more about your store.";
  }, [prodState, origin]);

  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <Link
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-6 w-16 h-16 rounded-full bg-black
                 flex items-center justify-center text-white shadow-lg
                 hover:bg-green-600 hover:scale-110 transition-all duration-300 z-50"
    >
      <img src="/whatsapp.svg" alt="WhatsApp" className="w-8 h-8" />
    </Link>
  );
}
