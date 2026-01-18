import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import BrandHero from "@/components/BrandHero";
import Hero from "@/components/Hero"; 
import ProductShowcase from "@/components/ProductShowcase";
import PantryGrid from "@/components/PantryGrid";
import FAQSection from "@/components/FAQSection";
import UsageSection from "@/components/UsageSection";

// 1. Define the Fetch Function
async function getHeroProduct() {
  return client.fetch(groq`
    *[_type == "homepage"][0].heroProduct->{
       _id,
       name,
       slug,
       sku,
       subtitle,
       badge,
       description,
       price,
       
       // Inventory Logic
       openingStock,
       stockOut,
       "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),
       
       // Imagery
       mainImage {
         asset
       },
       gallery[] {
         _key,
         asset
       },

       // Business Logic (Bundles)
       bundleOptions[] {
         title,
         count,
         price,
         savings,
         tag
       },

       // Storytelling & Trust
       benefits, 

       // Health Data
       nutrition {
         servingSize,
         calories,
         sugar,
         protein,
         fat
       },

       categories[]->{
         _id,
         title,
         slug
       }
    }
  `);
}

export const revalidate = 60; 

export default async function Home() {
  // 2. Fetch the Data
  const heroProduct = await getHeroProduct();

  // 🔹 FIX: Safely check the slug string inside the object
  // Sanity slugs are objects: { current: "freeze-dried", ... }
  const isFreezeDried = heroProduct?.categories?.some((c: any) => 
    c.slug?.current?.includes("freeze")
  );

  return (
    <div className="bg-cream pb-16 overflow-x-hidden">
      
      {/* 1. Brand Manifesto */}
      <BrandHero />

      {/* 2. The Hook */}
      {heroProduct && <Hero product={heroProduct} />}
      
      {/* 3. Usage Section (Conditional) */}
      {isFreezeDried && <UsageSection />}

      {/* 4. The Close */}
      {heroProduct && <ProductShowcase product={heroProduct} />}

      {/* 5. The Shelf */}
      <PantryGrid />

      {/* 6. Reassurance (Uncomment when ready) */}
      {/* <FAQSection /> */}

    </div>
  );
}