import DifferenceSection from "@/components/DifferenceSection";
import Hero from "@/components/Hero";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import ProductShowcase from "@/components/ProductShowcase";
import UsageSection from "@/components/UsageSection";
import FAQSection from "@/components/FAQSection";





export const revalidate = 60;
export default async function Home() {





  return (
    <div className="bg-tech_bg_color pb-16">
      {/* 🔹 Hero Section */}
      {/* <HomeBanner /> */}
      
<Hero />
<DifferenceSection />
<UsageSection />
<ProductShowcase />
<FAQSection />
      {/* 🔹 Featured Products */}
      {/* <div className="py-10">
        <ProductGrid />
      </div> */}


     
    
     
    </div>
  );
}
