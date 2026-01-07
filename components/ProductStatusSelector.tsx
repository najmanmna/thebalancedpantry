// "use client";
// import React from "react";
// import { useRouter } from "next/navigation";
// import Container from "./Container";
// import Title from "./Title";
// import Image from "next/image";

// import img1 from "../public/newarrivals.jpg";
// import img2 from "../public/hotselling.jpg";
// import img3 from "../public/3.jpg";

// const statuses = [
//   {
//     title: "NEW ARRIVALS",
//     value: "new",
//     image: img1,
//   },
//   {
//     title: "HOT SELLING",
//     value: "hot",
//     image: img2,
//   },
//   {
//     title: "BEST DEALS",
//     value: "best",
//     image: img3,
//   },
// ];

// const ProductStatusSelector = () => {
//   const router = useRouter();

//   const handleClick = (status: string) => {
//     router.push(`/deal/${status}`);
//   };

//   return (
//     <Container className="max-w-4xl py-20 mb-10">
//       <div className="text-center mb-10">
//         <Title className="text-3xl font-bold">Explore More</Title>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
//         {/* Left big card */}
//         <div
//           onClick={() => handleClick(statuses[0].value)}
//           className="md:w-[420px] md:h-[350px] relative cursor-pointer rounded-[50px] overflow-hidden shadow-lg md:col-span-2 group"
//         >
//           <Image
//             src={statuses[0].image}
//             alt={statuses[0].title}
//             className="w-full object-cover h-full transition-transform duration-500 group-hover:scale-105"
//             placeholder="blur"
//           />
//           <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
//             <h2 className="text-gray-100 hover:text-white text-2xl md:text-3xl font-semibold drop-shadow-lg">
//               {statuses[0].title}
//             </h2>
//           </div>
//         </div>

//         {/* Right side stacked 2 cards */}
//         <div className="flex flex-col gap-5 ">
//           {statuses.slice(1).map((status) => (
//             <div
//               key={status.value}
//               onClick={() => handleClick(status.value)}
//               className="md:w-[350px] h-[200px] relative cursor-pointer rounded-[50px] overflow-hidden shadow-lg group"
//             >
//               <Image
//                 src={status.image}
//                 alt={status.title}
//                 className="w-full  object-center transition-transform duration-500 group-hover:scale-110"
//                 placeholder="blur"
//               />
//               <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
//                 <h3 className="text-gray-300 hover:text-white text-xl md:text-2xl font-semibold drop-shadow-lg">
//                   {status.title}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Container>
//   );
// };

// export default ProductStatusSelector;
