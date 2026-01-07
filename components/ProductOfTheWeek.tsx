// import Image from "next/image";
// import Link from "next/link";
// import { client } from "@/sanity/lib/client";
// import { urlFor } from "@/sanity/lib/image";
// import PriceView from "@/components/PriceView";
// import Container from "@/components/Container";
// import Title from "@/components/Title";

// // GROQ query for Product of the Week
// const query = `
//   *[_type == "productOfTheWeek"][0]{
//     heading,
//     wasPrice,
//     promoImage,
//     product->{
//       _id,
//       name,
//       price,
//       "slug": slug.current,
//       variants[] {
//         _key,
//         images[]
//       }
//     }
//   }
// `;

// export default async function ProductOfTheWeek() {
//   const data = await client.fetch(query);

//   if (!data || !data.product) return null;

//   const { heading, wasPrice, promoImage, product } = data;

//   const imageUrl =
//     promoImage
//       ? urlFor(promoImage).url()
//       : product.variants?.[0]?.images?.[0]
//       ? urlFor(product.variants[0].images[0]).url()
//       : "/fallback-image.jpg";

//   return (
//     <section className="bg-neutral-50 sm:px-20 py-16 sm:py-24">
//       <Container>
//         <Title className="text-3xl font-bold text-center mb-12 sm:mb-12">
//           {heading || "Product of the Week"}
//         </Title>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//           {/* --- Text Column --- */}
//           <div className="space-y-6 md:order-1">
//             <h3 className="text-4xl sm:text-5xl font-extrabold text-black">
//               {product.name}
//             </h3>

//             {/* --- PRICE SECTION --- */}
//             <div className="flex flex-col gap-2 pt-4">
//               {wasPrice && (
//                 <div className="flex items-baseline gap-2">
//                   <span className="text-gray-500 text-lg font-medium">Was:</span>
//                   <PriceView
//                     price={wasPrice}
//                     className="text-2xl line-through text-gray-400"
//                   />
//                 </div>
//               )}

//               <div className="flex items-baseline gap-2">
//                 <span className="text-green-600 text-2xl font-medium">Now:</span>
//                 <PriceView
//                   price={product.price}
//                   className="text-4xl font-extrabold text-black"
//                 />
//               </div>
//             </div>
//             {/* --- END PRICE SECTION --- */}

//             <p className="text-gray-600 text-lg">
//               Don&apos;t miss out on this exclusive weekly offer! This price is
//               valid for a limited time only.
//             </p>

//             <Link
//               href={`/product/${product.slug}`}
//               className="inline-block bg-black text-white text-lg font-semibold px-10 py-4  shadow-md hover:bg-gray-800 transition-colors duration-300"
//             >
//               SHOP NOW
//             </Link>
//           </div>

//           {/* --- Image Column --- */}
//           <div className="group relative md:order-2">
//             <div className="w-full aspect-square rounded-xl shadow-lg overflow-hidden">
//               <Image
//                 src={imageUrl}
//                 alt={product.name || "Product of the Week"}
//                 width={600}
//                 height={600}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//               />
//             </div>
//           </div>
//         </div>
//       </Container>
//     </section>
//   );
// }
