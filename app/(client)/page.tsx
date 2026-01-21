import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import BrandHero from "@/components/BrandHero";
import Hero from "@/components/Hero"; 
import ProductShowcase from "@/components/ProductShowcase";
import PantryGrid from "@/components/PantryGrid";
import FAQSection from "@/components/FAQSection";
import UsageSection from "@/components/UsageSection";
import ScienceCTA from "@/components/ScienceCTA"; // 👈 Import the new component

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
       openingStock,
       stockOut,
       "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),
       mainImage { asset },
       gallery[] { _key, asset },
       bundleOptions[] { title, count, price, savings, tag },
       benefits, 
       nutrition { servingSize, calories, sugar, protein, fat },
       categories[]->{ _id, title, slug }
    }
  `);
}

export const revalidate = 60; 

export default async function Home() {
  const heroProduct = await getHeroProduct();

  // Safely check for "freeze" in category slug
  const isFreezeDried = heroProduct?.categories?.some((c: any) => 
    c.slug?.current?.includes("freeze")
  );

  return (
    <div className="bg-cream pb-16 overflow-x-hidden">
      
      <BrandHero />

      {heroProduct && <Hero product={heroProduct} />}
      
      {/* 3. Conditional Sections for Freeze Dried Items */}
      {isFreezeDried && (
        <>
          <UsageSection />
          {/* <ScienceCTA /> 👈 Added here: breaks up the flow nicely before the showcase */}
        </>
      )}

      {heroProduct && <ProductShowcase product={heroProduct} />}

      <PantryGrid />

      {/* <FAQSection /> */}

    </div>
  );
}