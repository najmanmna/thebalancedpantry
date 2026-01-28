import { sanityFetch } from "@/sanity/lib/live"; 
import { PRODUCT_BY_SLUG_QUERY } from "@/sanity/queries/query"; // 👈 Import the query
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
//  export const runtime = 'edge';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 🔹 Use the imported query
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) {
    return notFound();
  }

  return (
    <ProductClient product={product} />
  );
}