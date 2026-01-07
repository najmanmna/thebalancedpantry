// "use client";

// import { useState, useEffect } from "react";
// import { Dialog } from "@headlessui/react";
// import { X } from "lucide-react";
// import { client } from "@/sanity/lib/client";
// import { urlFor } from "@/sanity/lib/image";
// import Image from "next/image";
// import Link from "next/link";

// interface MarketingPopup {
//   _id: string;
//   image: { asset: { _ref: string } };
//   link: string;
//   displayDelay: number;
// }

// // 1. Fetch ALL active popups, sorted by updated time (newest first or last)
// const POPUP_QUERY = `*[_type == "marketingPopup" && isActive == true] | order(_updatedAt desc) {
//   _id,
//   image,
//   link,
//   displayDelay
// }`;

// const STORAGE_KEY = "seenMarketingPopups"; // Stores an array of IDs

// export default function MarketingPopupModal() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [popup, setPopup] = useState<MarketingPopup | null>(null);

//   useEffect(() => {
//     async function fetchPopup() {
//       try {
//         const allAds = await client.fetch<MarketingPopup[]>(POPUP_QUERY);
//         if (!allAds || allAds.length === 0) return;

//         // 2. Get the list of IDs the user has already seen
//         const seenString = localStorage.getItem(STORAGE_KEY);
//         const seenIds = seenString ? JSON.parse(seenString) : [];

//         // 3. Find the first ad in the list that is NOT in seenIds
//         const nextUnseenAd = allAds.find((ad) => !seenIds.includes(ad._id));

//         // If user has seen ALL ads, do nothing (or reset logic could go here)
//         if (!nextUnseenAd) return;

//         setPopup(nextUnseenAd);

//         // 4. Set Delay (Increase this to 5-8 seconds to avoid clashing with Promo Modal)
//         // If the specific ad has no delay set, default to 5 seconds
//         const delay = (nextUnseenAd.displayDelay || 5) * 1000;
        
//         const timer = setTimeout(() => {
//           setIsOpen(true);
//         }, delay);

//         return () => clearTimeout(timer);
//       } catch (err) {
//         console.error("Failed to fetch marketing popup", err);
//       }
//     }

//     fetchPopup();
//   }, []);

//   const handleClose = () => {
//     if (popup) {
//       // 5. Add this specific Ad ID to the "Seen" list
//       const seenString = localStorage.getItem(STORAGE_KEY);
//       const seenIds = seenString ? JSON.parse(seenString) : [];
      
//       // Add new ID if not exists
//       if (!seenIds.includes(popup._id)) {
//         seenIds.push(popup._id);
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds));
//       }
//     }
//     setIsOpen(false);
//   };

//   if (!popup || !isOpen) return null;

//   return (
//     // Z-Index is 60 (Promo modal is usually 50). 
//     // This ensures if they DO clash, this one is on top.
//     <Dialog open={isOpen} onClose={handleClose} className="relative z-[60]">
//       <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="relative w-full max-w-md overflow-hidden rounded-xl bg-transparent shadow-2xl animate-in fade-in zoom-in duration-300">
          
//           <button
//             onClick={handleClose}
//             className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-2 text-black hover:bg-white shadow-sm"
//           >
//             <X size={20} />
//           </button>

//           <Link href={popup.link} onClick={handleClose}>
//             <div className="relative aspect-[4/5] w-full cursor-pointer transition-transform hover:scale-[1.02]">
//               <Image
//                 src={urlFor(popup.image).width(600).auto('format').url()}
//                 alt="Special Offer"
//                 fill
//                 className="object-cover rounded-xl"
//                 sizes="(max-width: 768px) 100vw, 500px"
//               />
//             </div>
//           </Link>
          
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }