import CategoryProducts from "@/components/CategoryProducts";
import { getCategories, getMaterials } from "@/sanity/queries"; // Ensure these queries exist in your sanity/queries file
import React from "react";
 export const runtime = 'edge';
// ISR: Revalidate every 60 seconds
export const revalidate = 0;

const CategoryPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // 1. Await params (Next 15 requirement)
  const { slug } = await params;

  // 2. Fetch Filters & Categories Server-Side
  const categories = await getCategories();
  const materials = await getMaterials(); // Acts as Dietary Preferences

  return (
    <CategoryProducts
      categories={categories}
      slug={slug}
      materials={materials}
    />
  );
};

export default CategoryPage;