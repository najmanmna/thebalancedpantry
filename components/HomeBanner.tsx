// HomeBanner.tsx (Server Component)
import { getBanner } from "@/sanity/queries";
import CarouselWithDots from "./CarouselWithDots"; // client component

const HomeBanner = async () => {
  const banner = await getBanner(); // ✅ server-side fetch
  return <CarouselWithDots banner={banner} />; 
};

export default HomeBanner;
