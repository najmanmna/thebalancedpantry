"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { urlFor } from "@/sanity/lib/image";
import { useIsMobile } from "@/hooks/useIsMobile";

const CarouselWithDots = ({ banner }: { banner: any[] }) => {
  const [api, setApi] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMobile = useIsMobile();

  const filteredBanners = banner.filter((item) => {
    if (isMobile) {
      return item.showOn === "mobile" || item.showOn === "both";
    }
    return item.showOn === "desktop" || item.showOn === "both";
  });

  const onInit = (emblaApi: any) => {
    setApi(emblaApi);
    setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  };

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    // Removed col-span restrictions to ensure full width
    <div className="w-full h-[100dvh] relative bg-black -mt-[100px] md:-mt-[94px]">
      <Carousel
        className="w-full h-full"
        setApi={onInit}
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full ml-0"> {/* ml-0 fixes default gap */}
          {filteredBanners.map((item, index) => {
            const image = isMobile ? item?.mobile?.image : item?.desktop?.image;
            const buttonTheme = isMobile
              ? item?.mobile?.buttonTheme
              : item?.desktop?.buttonTheme;
            
            // Optimization: Load larger images for full screen
           const imageUrl = isMobile
  ? urlFor(image).width(1080).height(1920).quality(80).auto("format").url() // Standard Mobile
  : urlFor(image).width(1920).height(1080).quality(90).auto("format").url(); // Standard Desktop

            return (
              <CarouselItem key={index} className="pl-0 h-[100dvh] w-full relative">
                {image && (
                  <Image
                    src={imageUrl || "/fallback.png"}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-cover" // Ensures image covers full screen without distortion
                    priority={index === 0}
                  />
                )}

                {/* Optional Dark Overlay to make white header text pop */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                {/* Call to Action Button */}
                <a
                  href={item?.link || "/shop"}
                  className={`
                    absolute bottom-20 md:bottom-20 left-1/2 -translate-x-1/2
                    px-8 py-3 text-lg font-medium border shadow-xl z-20
                    transition-all duration-300 ease-in-out
                    ${
                      buttonTheme === "light"
                        ? "bg-white/10 backdrop-blur-md text-white border-white hover:bg-white hover:text-black"
                        : "bg-black/40 backdrop-blur-md text-white border-white hover:bg-black hover:border-transparent"
                    }
                  `}
                >
                  SHOP NOW
                </a>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Dots - Positioned absolutely at the bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {filteredBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                selectedIndex === i 
                  ? "bg-white w-8" // Active dot is wider
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselWithDots;