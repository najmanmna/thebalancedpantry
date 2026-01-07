"use client";

import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Category } from "@/sanity.types";
import { Button } from "./ui/button";
import { useEffect, useState, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, SlidersHorizontal, X, Clock } from "lucide-react";
import ProductCard from "./ProductCard";
import NoProductAvailable from "./NoProductAvailable";
import { useRouter } from "next/navigation";
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
import { Separator } from "./ui/separator";
import { Slider } from "@/components/ui/slider";

interface Props {
  categories: Category[];
  slug: string;
  materials: any[]; // relaxed type
}

const CategoryProducts = ({ categories, slug, materials }: Props) => {
  // Use any[] to avoid type conflicts until sanity.types.ts is regenerated
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- 🛒 STATE ---
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("new-arrivals");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  
  // Removed isPremium as it wasn't in the simplified schema
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [tempPrice, setTempPrice] = useState({ min: 0, max: 20000 });

  const currentSlug = slug;

  // --- Handlers ---
  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === currentSlug) return;
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
    setTempPrice({ min: 0, max: 20000 });
    setPriceRange({ min: 0, max: 20000 });
  };

  useEffect(() => {
    clearFilters();
    setIsPreOrder(false);
    setSortOption("new-arrivals");
  }, [currentSlug]);

  // --- 📡 FETCHING DATA ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: { [key: string]: any } = {
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
        };
        
        // 1. Base Filters
        let filters = [`_type == 'product'`, `isHidden != true`];

        // 2. Category Filter
        if (currentSlug && currentSlug !== "all") {
          filters.push(`references(*[_type == "category" && slug.current == $categorySlug]._id)`);
          params.categorySlug = currentSlug;
        }

        // 3. Material Filter (Top-level array)
        if (selectedMaterials.length > 0) {
          filters.push(`(defined(materials) && count((materials[]->slug.current)[@ in $materialSlugs]) > 0)`);
          params.materialSlugs = selectedMaterials;
        }

        // 4. Price Filter
        filters.push(`price >= $minPrice && price <= $maxPrice`);

        // 5. Pre-Order Filter
        if (isPreOrder) {
           filters.push(`isPreOrder == true`);
        }

        // --- 🔢 SORTING LOGIC ---
        let orderClause = "order(_createdAt desc)"; // Default

        if (sortOption === "new-arrivals") {
             orderClause = "order(select(status == 'new' => 1, 0) desc, _createdAt desc)";
        }
        else if (sortOption === "hotselling") {
             orderClause = "order(select(status == 'hot' => 1, 0) desc, _createdAt desc)";
        }
        else if (sortOption === "best-deals") {
             orderClause = "order(select(status == 'best' => 1, 0) desc, price asc)";
        }
        else if (sortOption === "offers") {
             orderClause = "order(coalesce(discount, 0) desc)";
        }
        else if (sortOption === "price-low") {
             orderClause = "order(price asc)";
        }
        else if (sortOption === "price-high") {
             orderClause = "order(price desc)";
        }
        
        // 🔹 UPDATED QUERY (Simplified Schema)
        const query = `
          *[${filters.join(" && ")}] | ${orderClause} {
            _id,
            name,
            slug,
            price,
            discount,
            status,
            isPreOrder,
            materials[]->{slug},
            
            // Simplified Stock Logic
            openingStock,
            stockOut,
            "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),

            // Top-level Images
            images[] { asset }
          }
        `;

        const data = await client.fetch(query, params);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => fetchProducts(), 100);
    return () => clearTimeout(timeout);
  }, [currentSlug, selectedMaterials, priceRange, sortOption, isPreOrder]);

  // Counts (Updated for top-level materials)
  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: any) => {
        p.materials?.forEach((m: any) => {
            if(m.slug?.current) counts[m.slug.current] = (counts[m.slug.current] || 0) + 1;
        })
    });
    return counts;
  }, [products]);


  return (
    <div className="pb-10">
        
      {/* 1. CATEGORY STRIP */}
      <div className="flex flex-col gap-4 mt-10 sm:mt-0 mb-2">
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
             <div className="flex gap-2.5">
                <button 
                   onClick={() => router.push('/category/all', { scroll: false })}
                   className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${currentSlug === "all" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}
                >
                   All Bags
                </button>
                {categories?.map((item) => (
                   <button 
                      key={item._id}
                      onClick={() => item?.slug?.current && handleCategoryChange(item.slug.current)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium border transition-all capitalize ${item?.slug?.current === currentSlug ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}
                   >
                      {item.title}
                   </button>
                ))}
             </div>
          </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="sticky top-[70px] z-30 bg-white/95 backdrop-blur-sm border-y border-gray-100 py-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2 border-gray-300 hover:border-black rounded-full px-4 text-sm font-medium">
                            <SlidersHorizontal className="w-4 h-4" /> Filters {selectedMaterials.length > 0 && <span className="ml-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{selectedMaterials.length}</span>}
                        </Button>
                    </SheetTrigger>
                    
                    <SheetContent side="right" className="w-[340px] flex flex-col h-full">
                        <SheetHeader className="text-left"><SheetTitle>Filters</SheetTitle></SheetHeader>
                        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
                            {/* Price */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-500">PRICE RANGE</h3>
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
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs</span>
                                                <Input type="number" value={tempPrice.min} onChange={(e) => setTempPrice({...tempPrice, min: Number(e.target.value)})} className="pl-8 h-10 text-sm" />
                                            </div>
                                            <span className="text-gray-400">-</span>
                                            <div className="relative w-full">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs</span>
                                                <Input type="number" value={tempPrice.max} onChange={(e) => setTempPrice({...tempPrice, max: Number(e.target.value)})} className="pl-8 h-10 text-sm" />
                                            </div>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            {/* Materials */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-500">MATERIALS</h3>
                                <div className="space-y-3">
                                    {materials?.map((item: any) => {
                                        if (!item?.slug || !item?.name) return null;
                                        return (
                                            <div key={item._id} className="flex items-center justify-between cursor-pointer group" onClick={() => item.slug && handleMaterialToggle(item.slug)}>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={selectedMaterials.includes(item.slug)} onCheckedChange={()=>{}} className="data-[state=checked]:bg-black data-[state=checked]:border-black" />
                                                    <span className="capitalize text-sm group-hover:text-gray-600">{item.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">({materialCounts[item.slug] || 0})</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <SheetFooter className="border-t pt-4">
                             <div className="flex w-full gap-3">
                                <Button variant="outline" onClick={clearFilters} className="flex-1 rounded-full border-gray-300">Clear</Button>
                                <SheetClose asChild><Button onClick={applyFilters} className="flex-1 rounded-full bg-black text-white hover:bg-gray-800">Show Results</Button></SheetClose>
                             </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <button
                  onClick={() => setIsPreOrder(!isPreOrder)}
                  className={`flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium transition-all border ${
                    isPreOrder
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pre-Order
                </button>
            </div>

            {/* SORTING DROPDOWN */}
            <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[160px] h-9 border-none shadow-none text-right font-medium focus:ring-0 px-0">
                    <div className="flex items-center justify-end gap-1"><span className="text-gray-400 font-normal">Sort:</span><SelectValue /></div>
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="new-arrivals">New Arrivals</SelectItem>
                    <SelectItem value="hotselling">Hot Selling</SelectItem>
                    <SelectItem value="best-deals">Best Deals</SelectItem>
                    <SelectItem value="offers">Top Offers</SelectItem>
                    <Separator className="my-1"/>
                    <SelectItem value="price-low">Price: Low - High</SelectItem>
                    <SelectItem value="price-high">Price: High - Low</SelectItem>
                </SelectContent>
            </Select>
         </div>
         
         {(selectedMaterials.length > 0 || isPreOrder || priceRange.min > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
               {isPreOrder && <span className="px-3 py-1 rounded-full text-xs bg-gray-100 flex items-center gap-2">Pre-Order <X size={12} className="cursor-pointer" onClick={()=>setIsPreOrder(false)}/></span>}
               {selectedMaterials.map(m => <span key={m} className="px-3 py-1 rounded-full text-xs bg-gray-100 flex items-center gap-2 capitalize">{m} <X size={12} className="cursor-pointer" onClick={()=>handleMaterialToggle(m)}/></span>)}
               {priceRange.min > 0 && <span className="px-3 py-1 rounded-full text-xs bg-gray-100 flex items-center gap-2">Price {priceRange.min}-{priceRange.max} <X size={12} className="cursor-pointer" onClick={()=>setPriceRange({min:0, max:20000})}/></span>}
            </div>
         )}
      </div>

      <div className="w-full">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <AnimatePresence key={product._id}>
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <NoProductAvailable selectedTab={currentSlug} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;