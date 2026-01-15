// app/category/[slug]/page.tsx
import CategoryProducts from "@/components/CategoryProducts";
import { getCategories, getMaterials } from "@/sanity/queries";
import React from "react";

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

const CategoryPage = async ({ params }: { params: { slug: string } }) => {
  // 1. Fetch data on the server
  const categories = await getCategories();
  const materials = await getMaterials(); // These act as your Dietary Preferences now
  
  // 2. Extract slug
  const { slug } = params;

  return (
    // 3. Render the main component directly. 
    // We removed <Container> because CategoryProducts handles the full-width background itself.
    <CategoryProducts
      categories={categories}
      slug={slug}
      materials={materials}
    />
  );
};

export default CategoryPage;