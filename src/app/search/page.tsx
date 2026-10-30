"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search as SearchIcon, X, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, Product } from "@/context/CartContext";

const RECENT_SEARCHES = ["frock", "dress", "boy set", "hoodie", "romper"];

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Search Collection</h1>
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<(Product & { mrp?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { totalItems } = useCart();

  // Fetch live products from DB
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(
            data.map((p) => ({
              id: p.id.toString(),
              name: p.name,
              price: p.price,
              mrp: Math.round(p.price * 1.5),
              imageUrl: p.imageUrl || "",
              ageGroup: p.ageGroup,
              ageGroups: p.ageGroups,
              category: p.category,
              categories: p.categories,
            }))
          );
        }
      })
      .catch((err) => console.error("Could not fetch products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return products;
    const lower = query.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(lower);
      const matchCategory =
        (p.category && p.category.toLowerCase().includes(lower)) ||
        (Array.isArray(p.categories) && p.categories.some((c) => c.toLowerCase().includes(lower)));
      const matchAge =
        (p.ageGroup && p.ageGroup.toLowerCase().includes(lower)) ||
        (Array.isArray(p.ageGroups) && p.ageGroups.some((a) => a.toLowerCase().includes(lower)));
      return matchName || matchCategory || matchAge;
    });
  }, [query, products]);

  return (
    <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Screen 7 Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 -ml-1 text-gray-700 hover:text-[#ff2b75]"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Babybloom Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs flex-shrink-0">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="Babybloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold text-[#ff2b75] tracking-tight">Babybloom</span>
        </Link>

        <Link href="/cart" className="p-1 text-gray-700 hover:text-[#ff2b75] relative">
          <ShoppingBag size={21} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ff2b75] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full flex-1 space-y-4">
        {/* Desktop Title Header (Single H1 in DOM across mobile & desktop) */}
        <div className="sr-only md:not-sr-only md:flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Search Collection</h1>
            <p className="text-xs text-gray-500 mt-1">Find trendy clothes, party wear & everyday essentials for kids</p>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {searchResults.length} Products Found
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative max-w-2xl">
          <SearchIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search frocks, rompers, boys sets..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff2b75] focus:bg-white transition-all shadow-2xs"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Recent Searches Row */}
        <div>
          <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-2">
            Recent Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  query.toLowerCase() === term
                    ? "bg-pink-50 border-[#ff2b75] text-[#ff2b75]"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header: "Products (24 Results)" */}
        <div className="pt-2">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
            Products <span className="font-semibold text-gray-500">({searchResults.length} Results)</span>
          </h2>
        </div>

        {/* Responsive Product Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#ff2b75] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-bold text-gray-700 text-sm">Loading products from store...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="font-bold text-gray-700 text-base">No products matching "{query}"</p>
            <p className="text-xs text-gray-400">Try searching with a different term like frock, boy set, or romper.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </main>
  );
}
