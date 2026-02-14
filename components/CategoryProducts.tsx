"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";

import { Category } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import ProductCard from "./ProductCard";
import NoProductAvailable from "./NoProductAvailable";

// UI Components
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface Props {
  categories: Category[];
  slug: string;
  materials: any[]; // Dietary Preferences
}

const CategoryProducts = ({ categories, slug, materials }: Props) => {
  const router = useRouter();
  
  // --- STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("new-arrivals");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [tempPrice, setTempPrice] = useState({ min: 0, max: 20000 });

  // --- HANDLERS ---
  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === slug) return;
    router.push(`/category/${newSlug}`, { scroll: false });
  };

  const handleMaterialToggle = (materialSlug: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialSlug)
        ? prev.filter((s) => s !== materialSlug)
        : [...prev, materialSlug]
    );
  };

  const applyFilters = () => {
    setPriceRange(tempPrice);
  };

  const clearFilters = () => {
    setSelectedMaterials([]);
    setTempPrice({ min: 0, max: 20000000 });
    setPriceRange({ min: 0, max: 20000000 });
  };

  // Reset filters when changing category
  useEffect(() => {
    clearFilters();
    setSortOption("new-arrivals");
  }, [slug]);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 1. Base Filter (Only products)
        const filters = [`_type == 'product'`];

        // 2. Category Filter (Skip if "all")
        // 🔹 FIX: This ensures 'All Items' shows everything
        if (slug && slug !== "all") {
          filters.push(`references(*[_type == "category" && slug.current == "${slug}"]._id)`);
        }

        // 3. Material/Dietary Filter
        if (selectedMaterials.length > 0) {
          // Converts array to string for GROQ: "['vegan', 'gluten-free']"
          const materialsString = JSON.stringify(selectedMaterials);
          filters.push(`count((materials[]->slug.current)[@ in ${materialsString}]) > 0`);
        }

        // 4. Price Filter
        filters.push(`price >= ${priceRange.min} && price <= ${priceRange.max}`);

        // 5. Sorting
        let orderClause = "order(_createdAt desc)";
        if (sortOption === "price-low") orderClause = "order(price asc)";
        if (sortOption === "price-high") orderClause = "order(price desc)";

        // 🔹 UPDATED QUERY (Matches your new Product Schema)
        const query = `*[${filters.join(" && ")}] | ${orderClause} {
            _id,
            name,
            "slug": slug.current,
            price,
            badge,
            subtitle,
            
            // Image Logic
            mainImage { asset },
            
            // Stock Logic
            openingStock,
            stockOut,
            "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),

            // Dietary Tags
            materials[]->{
              "slug": slug.current,
              name
            }
        }`;

        const data = await client.fetch(query, {}, {
      cache: 'no-store',      // 👈 Disables Browser Cache
      next: { revalidate: 0 } // 👈 Disables Next.js Cache
    });
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly to prevent flicker on rapid clicks
    const t = setTimeout(fetchProducts, 100);
    return () => clearTimeout(t);
  }, [slug, selectedMaterials, priceRange, sortOption]);

  // Calculate dynamic counts for filters based on CURRENT loaded products
  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: any) => {
      p.materials?.forEach((m: any) => {
        if (m.slug) counts[m.slug] = (counts[m.slug] || 0) + 1;
      });
    });
    return counts;
  }, [products]);

  return (
    <div className="pb- pt-20 bg-cream min-h-screen">
      
      {/* 1. STICKY CATEGORY NAV */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-charcoal/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 justify-start sm:justify-center min-w-max">
                <button
                  onClick={() => router.push('/category/all', { scroll: false })}
                  className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all border ${
                    slug === "all"
                      ? "bg-charcoal text-cream border-charcoal shadow-md"
                      : "bg-white text-charcoal/60 border-charcoal/10 hover:border-charcoal/30"
                  }`}
                >
                  All Items
                </button>
                {categories?.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => item?.slug?.current && handleCategoryChange(item.slug.current)}
                    className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all border capitalize ${
                      item?.slug?.current === slug
                        ? "bg-charcoal text-cream border-charcoal shadow-md"
                        : "bg-white text-charcoal/60 border-charcoal/10 hover:border-charcoal/30"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* 2. FILTER & SORT BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-charcoal/5 p-3 shadow-sm">
          
          {/* Filter Trigger (Mobile Sheet) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 hover:bg-charcoal/5 rounded-full px-4 text-sm font-serif font-bold text-charcoal">
                <SlidersHorizontal className="w-4 h-4" />
                Filter Pantry
                {selectedMaterials.length > 0 && (
                  <span className="ml-1 bg-brandRed text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {selectedMaterials.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[340px] flex flex-col h-full bg-cream border-l border-charcoal/10">
              <SheetHeader className="text-left border-b border-charcoal/5 pb-4">
                <SheetTitle className="font-serif text-2xl font-black text-charcoal">Curate View</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
                {/* Price Filter */}
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-xs tracking-[0.2em] text-charcoal/40 uppercase">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 20000]}
                      min={0} max={20000} step={500}
                      value={[tempPrice.min, tempPrice.max]}
                      onValueChange={(val) => setTempPrice({ min: val[0], max: val[1] })}
                      className="mb-6"
                    />
                    <div className="flex items-center gap-3">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/40 font-bold">LKR</span>
                        <Input
                          type="number"
                          value={tempPrice.min}
                          onChange={(e) => setTempPrice({ ...tempPrice, min: Number(e.target.value) })}
                          className="pl-10 h-10 text-sm bg-white border-charcoal/10 rounded-xl"
                        />
                      </div>
                      <span className="text-charcoal/20">-</span>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/40 font-bold">LKR</span>
                        <Input
                          type="number"
                          value={tempPrice.max}
                          onChange={(e) => setTempPrice({ ...tempPrice, max: Number(e.target.value) })}
                          className="pl-10 h-10 text-sm bg-white border-charcoal/10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-charcoal/5"></div>

                {/* Dietary Filter */}
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-xs tracking-[0.2em] text-charcoal/40 uppercase">Preferences</h3>
                  <div className="space-y-1">
                    {materials?.map((item: any) => {
                      const matSlug = item?.slug?.current || item?.slug;
                      if (!matSlug || !item?.name) return null;

                      return (
                        <div key={item._id} 
                             className="flex items-center justify-between cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors" 
                             onClick={() => handleMaterialToggle(matSlug)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedMaterials.includes(matSlug)}
                              onCheckedChange={() => {}}
                              className="border-charcoal/20 data-[state=checked]:bg-brandRed data-[state=checked]:border-brandRed"
                            />
                            <span className="capitalize text-sm font-medium text-charcoal">{item.name}</span>
                          </div>
                          {/* Count */}
                          <span className="text-xs text-charcoal/30 font-bold">
                            {materialCounts[matSlug] || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t border-charcoal/5 pt-4 gap-3 sm:gap-0">
                <Button variant="outline" onClick={clearFilters} className="flex-1 rounded-full border-charcoal/10 text-charcoal/60 hover:text-charcoal">
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button onClick={applyFilters} className="flex-1 rounded-full bg-brandRed text-cream hover:bg-brandRed/90 shadow-md">
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Sorting */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] h-9 border-none shadow-none text-right font-sans text-sm focus:ring-0 px-0 bg-transparent gap-2">
              <span className="text-charcoal/40 font-bold text-xs uppercase tracking-wider">Sort By:</span>
              <SelectValue className="font-bold text-charcoal" />
            </SelectTrigger>
            <SelectContent align="end" className="bg-white border-charcoal/10 rounded-xl shadow-lg">
              <SelectItem value="new-arrivals" className="cursor-pointer">Newest Arrivals</SelectItem>
              <SelectItem value="price-low" className="cursor-pointer">Price: Low - High</SelectItem>
              <SelectItem value="price-high" className="cursor-pointer">Price: High - Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Chips */}
        {(selectedMaterials.length > 0 || priceRange.min > 0 || priceRange.max < 20000) && (
          <div className="flex flex-wrap gap-2 mt-3 px-1">
            {selectedMaterials.map((m) => (
              <span key={m} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white border border-charcoal/10 flex items-center gap-2 text-charcoal shadow-sm">
                {m} 
                <X size={12} className="cursor-pointer hover:text-brandRed" onClick={() => handleMaterialToggle(m)} />
              </span>
            ))}
            {(priceRange.min > 0 || priceRange.max < 20000) && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white border border-charcoal/10 flex items-center gap-2 text-charcoal shadow-sm">
                LKR {priceRange.min} - {priceRange.max} 
                <X size={12} className="cursor-pointer hover:text-brandRed" onClick={() => {
                   setPriceRange({ min: 0, max: 20000 });
                   setTempPrice({ min: 0, max: 20000 });
                }} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-charcoal/10 border-t-brandRed rounded-full animate-spin"></div>
            <p className="font-serif italic text-charcoal/40">Curating pantry...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <AnimatePresence key={product._id}>
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProductAvailable selectedTab={slug} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;