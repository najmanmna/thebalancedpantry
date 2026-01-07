import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";






export const revalidate = 60;
export default async function Home() {





  return (
    <div className="bg-tech_bg_color pb-16">
      {/* 🔹 Hero Section */}
      <HomeBanner />

      {/* 🔹 Featured Products */}
      <div className="py-10">
        <ProductGrid />
      </div>


     
    
     
    </div>
  );
}
