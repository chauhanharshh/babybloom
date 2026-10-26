"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, ArrowUpDown, SlidersHorizontal, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/context/CartContext";

interface CategoryListingViewProps {
  title: string;
  initialProducts: (Product & { mrp?: number; style?: string; discountPercent?: number; offerTitle?: string })[];
  subcategories?: string[];
}

const STYLE_OPTIONS = ["Regular", "Casual", "Party Wear", "Ethnic Wear"];

export default function CategoryListingView({
  title,
  initialProducts,
  subcategories = ["All"],
}: CategoryListingViewProps) {
  const router = useRouter();
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Filter by subcategory keyword if not 'All'
    if (activeSubcategory !== "All") {
      const target = activeSubcategory.toLowerCase();
      list = list.filter((p) => {
        const matchesStyle = (p.style || "").toLowerCase() === target;
        const matchesText =
          p.name.toLowerCase().includes(target) ||
          (p.description ? p.description.toLowerCase().includes(target) : false);
        return matchesStyle || matchesText;
      });
    }

    // Sort
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [initialProducts, activeSubcategory, sortBy]);

  return (
    <main className="min-h-screen bg-white flex flex-col pb-20 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <CartDrawer />

      {/* Screen 3 Mobile Header: [<] Title [🔍] */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 -ml-1 text-gray-700 hover:text-[#ff2b75] transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-base font-extrabold text-gray-900 tracking-tight text-center truncate px-2">
          {title}
        </h1>

        <Link
          href="/search"
          className="p-1 -mr-1 text-gray-700 hover:text-[#ff2b75] transition-colors"
          aria-label="Search products"
        >
          <Search size={20} />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8 w-full flex-1">
        {/* Desktop Title Header */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-xs text-gray-500 mt-1">Showing {filteredProducts.length} trendy items for your little ones</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Category:</span>
            <span className="text-xs font-bold text-[#ff2b75]">{activeSubcategory}</span>
          </div>
        </div>

        {/* Action Bar (Sort & Filters) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Subcategory Chips (Horizontal Scroll on Mobile, Wrapped on Desktop) */}
          <div className="flex overflow-x-auto sm:flex-wrap no-scrollbar gap-2 pb-1 sm:pb-0" style={{ scrollbarWidth: "none" }}>
            {subcategories.map((sub) => {
              const isActive = activeSubcategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setActiveSubcategory(sub)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer ${
                    isActive
                      ? "bg-[#ff2b75] text-white border border-[#ff2b75]"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[#ff2b75]"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Sort & Filter Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 shrink-0">
            {/* Sort Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full sm:w-auto bg-[#ff2b75] hover:bg-[#e01d62] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowUpDown size={14} />
                <span>Sort</span>
              </button>

              {/* Sort Dropdown */}
              {isSortOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 py-1 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("featured");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center justify-between"
                  >
                    <span>Featured</span>
                    {sortBy === "featured" && <Check size={14} className="text-[#ff2b75]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("price-asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center justify-between"
                  >
                    <span>Price: Low to High</span>
                    {sortBy === "price-asc" && <Check size={14} className="text-[#ff2b75]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("price-desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-800 hover:bg-pink-50 flex items-center justify-between"
                  >
                    <span>Price: High to Low</span>
                    {sortBy === "price-desc" && <Check size={14} className="text-[#ff2b75]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setActiveSubcategory("All")}
              className="w-full sm:w-auto bg-white border border-gray-200 text-gray-800 hover:border-[#ff2b75] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Products Grid (2 columns mobile, 3 on tablet, 4 on desktop) */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 space-y-2">
            <p className="font-bold text-gray-700 text-base">No products found in this category.</p>
            <p className="text-xs">Try selecting a different filter above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {filteredProducts.map((product) => (
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
