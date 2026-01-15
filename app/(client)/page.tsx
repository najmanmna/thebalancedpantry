import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import BrandHero from "@/components/BrandHero";
import Hero from "@/components/Hero"; // Assuming this is your "StrawberrySpotlight" section
import ProductShowcase from "@/components/ProductShowcase";
import PantryGrid from "@/components/PantryGrid";
import FAQSection from "@/components/FAQSection";

// 1. Define the Fetch Function
async function getHeroProduct() {
  // 1. Find the homepage document
  // 2. Follow the reference (->) to the heroProduct
  // 3. Get the product fields
  return client.fetch(groq`
    *[_type == "homepage"][0].heroProduct->{
       _id,
       name,
       slug,
       subtitle,
       badge,
       description,
       price,
       openingStock,
       stockOut,
       mainImage,
       bundleOptions,
       benefits,
       nutrition
    }
  `);
}
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // 2. Fetch the Data
  const heroProduct = await getHeroProduct();

  return (
    <div className="bg-cream pb-16 overflow-x-hidden">
      
      {/* 1. Brand Manifesto: "We are a curated pantry" */}
      <BrandHero />

      {/* 2. The Hook: "The Nostalgia of Fresh Fruit" */}
{heroProduct && <Hero product={heroProduct} />}

      {/* 3. The Close: Buy the Strawberries (Dynamic Data) */}
      {/* We only render this if the product is found to prevent errors */}
      {heroProduct && <ProductShowcase product={heroProduct} />}

      {/* 4. The Shelf: "Shop other items" */}
      <PantryGrid />

      {/* 5. Reassurance */}
      {/* <FAQSection /> */}

    </div>
  );
}