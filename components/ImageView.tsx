"use client";
import React, { useState, useEffect } from "react";
import { urlFor } from "@/sanity/lib/image";
import { motion, AnimatePresence } from "motion/react"; // Can't use "framer-motion" with "react-inner-image-zoom"
import { X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";

interface Props {
  images?: Array<{
    _key: string;
    asset?: { _ref: string };
  }>;
  isStock?: number;
  isPreOrder?: boolean;
}

export default function ImageView({
  images = [],
  isStock,
  isPreOrder,
}: Props) {
  const [active, setActive] = useState(images[0]);
  const [showModal, setShowModal] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (images.length > 0) setActive(images[0]);
  }, [images]);

  const openModal = (i: number) => {
    setInitialSlide(i);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "auto";
  };

  const StatusBadge = () => {
    if (isPreOrder) {
      return (
        <span className="absolute top-3 left-3 bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full z-10">
          Pre-Order
        </span>
      );
    }
    if (isStock === 0) {
      return (
        <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full z-10">
          Out of Stock
        </span>
      );
    }
    return null;
  };

  const imageClassName = `object-contain w-full max-h-full ${
    isStock === 0 && !isPreOrder ? "opacity-50" : ""
  }`;

  const modalImageClassName = `object-contain max-h-[80vh] w-full ${
    isStock === 0 && !isPreOrder ? "opacity-50" : ""
  }`;

  return (
    <>
      <div className="w-full md:w-2/5 flex flex-col md:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-2 md:gap-3 items-center md:items-start">
          {images.map((img, idx) => (
            <button
              key={`${img._key}-${idx}`}
              onClick={() => setActive(img)}
              className={`border rounded-md overflow-hidden w-16 h-16 md:w-20 md:h-20 ${
                active?._key === img._key ? "ring-2 ring-tech_dark_color" : ""
              }`}
            >
              <img
                // --- ✅ OPTIMIZED ---
                src={urlFor(img).width(160).auto("format").quality(70).url()}
                alt={`thumb-${idx}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>

        {/* Magnified main image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active?._key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex-1 border rounded-md overflow-hidden cursor-zoom-in"
            onClick={() =>
              openModal(images.findIndex((i) => i._key === active?._key))
            }
          >
            <StatusBadge />
            {active && (
              <InnerImageZoom
                // --- ✅ OPTIMIZED ---
                src={urlFor(active)
                  .width(800) // Good size for the main view
                  .auto("format")
                  .quality(75)
                  .url()}
                zoomSrc={urlFor(active)
                  .width(1600) // Higher res for zoom
                  .auto("format")
                  .quality(80)
                  .url()}
                zoomScale={isMobile ? 1.2 : 1.2}
                zoomType={isMobile ? "click" : "hover"}
                zoomPreload
                className={imageClassName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal carousel with zoom */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white max-w-2xl w-full p-4 relative max-h-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow"
              >
                <X className="h-6 w-6" />
              </button>

              <Carousel className="w-full" opts={{ startIndex: initialSlide }}>
                <CarouselContent>
                  {images.map((img, idx) => (
                    <CarouselItem key={`${img._key}-modal-${idx}`}>
                      {" "}
                      <div className="relative flex items-center justify-center ">
                        <StatusBadge />
                        <InnerImageZoom
                          // --- ✅ OPTIMIZED ---
                          src={urlFor(img)
                            .width(1400) // Good size for modal (2xl * 2)
                            .auto("format")
                            .quality(75)
                            .url()}
                          zoomSrc={urlFor(img)
                            .width(2000) // Higher res for zoom
                            .auto("format")
                            .quality(80)
                            .url()}
                          zoomScale={isMobile ? 1.1 : 1.1}
                          zoomType={isMobile ? "click" : "hover"}
                          zoomPreload
                          className={modalImageClassName}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </Carousel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}