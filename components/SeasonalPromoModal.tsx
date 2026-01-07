// "use client";

// import { useState, useEffect } from "react";
// import { Dialog } from "@headlessui/react";
// import { X, ChevronLeft, ChevronRight, Copy } from "lucide-react";
// import { client } from "@/sanity/lib/client";
// import { urlFor } from "@/sanity/lib/image";
// import toast from "react-hot-toast";
// import Image from "next/image";

// // Interface
// interface SanityPromoCode {
//   _id: string;
//   title: string;
//   code: string;
//   discountPercentage: number;
//   minOrderAmount: number;
//   firstOrderOnly: boolean;
//   isFreeShipping: boolean;
//   promoImage?: { asset: { _ref: string } };
// }

// // Query
// const PROMO_QUERY = `*[_type == "promoCode" && isActive == true]{
//   _id,
//   title,
//   code,
//   discountPercentage,
//   minOrderAmount,
//   firstOrderOnly,
//   isFreeShipping,
//   promoImage
// }`;

// // --- 1. Renamed storage key for clarity ---
// const STORAGE_KEY = "seenPromoSet";

// export default function SeasonalPromoModal() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [promos, setPromos] = useState<SanityPromoCode[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // --- 2. Combined "Show Once" and Fetch Logic ---
//   // This now runs on page load to decide IF the modal should open.
//   useEffect(() => {
//     async function checkAndFetchPromos() {
//       try {
//         const data = await client.fetch<SanityPromoCode[]>(PROMO_QUERY);
        
//         // If no promos are active, do nothing.
//         if (!data || data.length === 0) {
//           return; 
//         }

//         // Create a unique "signature" of the current active promos
//         // We sort them to ensure the order doesn't matter
//         const currentPromoSet = data.map(p => p._id).sort().join(',');
        
//         // Get the last set of promos the user saw
//         const seenPromoSet = localStorage.getItem(STORAGE_KEY);

//         // Compare! If the new set is different, show the modal.
//         if (currentPromoSet !== seenPromoSet) {
//           setPromos(data);
//           setIsOpen(true);
//         }
//       } catch (err) {
//         console.error("Failed to fetch promos", err);
//       }
//     }

//     checkAndFetchPromos();
//   }, []); // Runs only once on page load

//   // --- 3. Updated HandleClose Logic ---
//   const handleClose = () => {
//     // Create the signature of the promos we just showed
//     const promoSet = promos.map(p => p._id).sort().join(',');
    
//     // Save this new signature as the "seen" set
//     localStorage.setItem(STORAGE_KEY, promoSet);
//     setIsOpen(false);
//   };

//   const handleCopy = (code: string) => {
//     navigator.clipboard.writeText(code);
//     toast.success(`Code "${code}" copied to clipboard!`);
//   };

//   const nextPromo = () => {
//     setCurrentIndex((prev) => (prev + 1) % promos.length);
//   };

//   const prevPromo = () => {
//     setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
//   };

//   if (!isOpen || promos.length === 0) {
//     return null;
//   }

//   const currentPromo = promos[currentIndex];
//   const hasImage = !!currentPromo.promoImage;

//   return (
//     <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
//       {/* The backdrop */}
//       <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

//       {/* Full-screen container to center the panel */}
//       <div className="fixed inset-0 flex items-center justify-center p-4">
        
//         <Dialog.Panel
//           className={`w-full ${
//             hasImage ? "max-w-2xl" : "max-w-md"
//           } overflow-hidden rounded-lg bg-white shadow-xl`}
//         >
//           <div
//             className={`grid ${
//               hasImage ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
//             }`}
//           >
//             {/* Column 1: Image (Only if it exists) */}
//             {hasImage && (
//               <div className="relative hidden h-full min-h-[400px] md:block">
//                 <Image
//                   src={urlFor(currentPromo.promoImage!).width(800).auto('format').url()}
//                   alt={currentPromo.title || "Promo Image"}
//                   fill
//                   className="object-cover"
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   priority={true}
//                 />
//                 <div className="absolute inset-0 bg-black/30" />
//               </div>
//             )}

//             {/* Column 2: Content */}
//             <div className="flex flex-col justify-center p-8">
//               <button
//                 onClick={handleClose}
//                 className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-900"
//               >
//                 <X size={24} />
//               </button>

//               <div className="text-center">
//                 <h3 className="font-serif text-3xl font-medium text-gray-900">
//                   {currentPromo.title}
//                 </h3>
                
//                 {/* ... inside your render ... */}

// <p className="mt-3 text-lg text-gray-700">
//   {/* ✅ CLEANER LOGIC using the new boolean */}
//   {currentPromo.isFreeShipping ? (
//     <>
//       Enjoy <strong className="text-2xl text-black">FREE DELIVERY</strong> on your order!
//     </>
//   ) : (
//     <>
//       Get{" "}
//       <strong className="text-2xl text-black">
//         {currentPromo.discountPercentage}% OFF
//       </strong>{" "}
//       your order!
//     </>
//   )}
// </p>

//                 <p className="mt-6 text-sm text-gray-500">
//                   Use the code below to checkout:
//                 </p>
//                 <div
//                   onClick={() => handleCopy(currentPromo.code)}
//                   className="group my-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-black"
//                 >
//                   <span className="font-mono text-xl font-bold tracking-widest text-black">
//                     {currentPromo.code}
//                   </span>
//                   <Copy
//                     size={18}
//                     className="text-gray-400 transition-colors group-hover:text-black"
//                   />
//                 </div>

//                 <p className="mt-4 text-xs text-gray-500">
//                   {currentPromo.minOrderAmount > 0
//                     ? `Minimum order of Rs. ${currentPromo.minOrderAmount}. `
//                     : ""}
//                   {currentPromo.firstOrderOnly
//                     ? "For first-time orders only."
//                     : ""}
//                 </p>
//               </div>

//               {/* Carousel Navigation */}
//               {promos.length > 1 && (
//                 <div className="mt-6 flex items-center justify-between">
//                   <button
//                     onClick={prevPromo}
//                     className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
//                   >
//                     <ChevronLeft size={20} />
//                   </button>
//                   <span className="text-sm font-medium text-gray-700">
//                     {currentIndex + 1} / {promos.length}
//                   </span>
//                   <button
//                     onClick={nextPromo}
//                     className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
//                   >
//                     <ChevronRight size={20} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }