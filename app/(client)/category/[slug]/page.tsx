// // app/category/[slug]/page.tsx
// import Container from "@/components/Container";
// import CategoryProducts from "@/components/CategoryProducts";
// import Title from "@/components/Title";
// import { getCategories, getMaterials } from "@/sanity/queries";
// import React from "react";

// const CategoryPage = async ({
//   params,
// }: {
//   params: { slug: string };
// }) => {
//   const { slug } = params;
//   const categories = await getCategories();
//   const materials = await getMaterials();

//   // --- 👇 1. Check if this is the "All Bags" page ---
//   const isAllProductsPage = slug === "all";

//   return (
//     <div>
//       <Container className="py-10">
//         {/* --- 👇 2. Conditionally render the title --- */}
//           {/* {isAllProductsPage ? (
//             <Title className="text-xl">All Products</Title>
//           ) : (
//             <Title className="text-xl">
//               Products by Category:{" "}
//               <span className="font-bold text-green-600 capitalize tracking-wide">
//                 {slug}
//               </span>
//             </Title>
//           )} */}
//         {/* --- ------------------------------------ --- */}

//         <CategoryProducts
//           categories={categories}
//           slug={slug} // Pass the slug ("all" or "tote-bags")
//           materials={materials}
//         />
//       </Container>
//     </div>
//   );
// };

// export default CategoryPage;