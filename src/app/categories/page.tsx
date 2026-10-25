"use client";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import LazyImage from "@/components/LazyImage";
import Link from "next/link";
import { useState } from "react";

const CATEGORIES = [
  {
    title: "Newborn",
    sub: "(0-12 Months)",
    href: "/newborn",
    bg: "bg-[#ffe4ec] border-[#fecdd3]",
    image: "/images/categories/newborn-romper.jpg",
  },
  {
    title: "Girls Wear",
    sub: "(1-9 Years)",
    href: "/girls",
    bg: "bg-[#fef3c7] border-[#fde68a]",
    image: "/images/categories/girls-wear.jpg",
  },
  {
    title: "Boys Wear",
    sub: "(1-9 Years)",
    href: "/boys",
    bg: "bg-[#e0f2fe] border-[#bae6fd]",
    image: "/images/categories/boys-wear.jpg",
  },
  {
    title: "Sweatshirts",
    sub: "& Hoodies",
    href: "/shop?cat=Sweatshirts",
    bg: "bg-[#fce7f3] border-[#fbcfe8]",
    image: "/images/categories/sweatshirts.jpg",
  },
  {
    title: "Frocks &",
    sub: "Dresses",
    href: "/girls",
    bg: "bg-[#f3e8ff] border-[#e9d5ff]",
    image: "/images/categories/frocks.jpg",
  },
  {
    title: "Sets & Co-ord",
    sub: "Sets",
    href: "/shop?cat=Sets",
    bg: "bg-[#ffedd5] border-[#fed7aa]",
    image: "/images/categories/coord-sets.jpg",
  },
  {
    title: "Pants &",
    sub: "Jeans",
    href: "/boys",
    bg: "bg-[#e0f2fe] border-[#bae6fd]",
    image: "/images/categories/pants-jeans.jpg",
  },
  {
    title: "Innerwear",
    sub: "(Soft Cotton)",
    href: "/newborn",
    bg: "bg-[#ffe4ec] border-[#fecdd3]",
    image: "/images/categories/innerwear.jpg",
  },
];

const AGE_GROUPS = ["0-6M", "6-12M", "1-3Y", "3-5Y", "5-9Y"];

export default function CategoriesPage() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white flex flex-col pb-20 md:pb-8">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        {/* Title: Shop by Category */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Shop by Category
        </h1>

        {/* 3-Column Categories Grid (Exact Screen 2 Layout) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="flex flex-col items-center group transition-transform active:scale-95 hover:-translate-y-1"
            >
              {/* Category Card Box with Pastel Background */}
              <div
                className={`w-full aspect-square rounded-2xl ${cat.bg} border p-2 flex flex-col items-center justify-center shadow-xs relative overflow-hidden transition-all group-hover:shadow-md`}
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LazyImage
                    src={cat.image}
                    alt={cat.title}
                    fill
                    loading="lazy"
                    className="object-contain"
                    fallbackText={cat.title}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="mt-1.5 text-center w-full">
                <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight group-hover:text-[#ff2b75] transition-colors truncate">
                  {cat.title}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                  {cat.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Section 2: Shop by Age */}
        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 tracking-tight">
            Shop by Age
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {AGE_GROUPS.map((age) => {
              const isSelected = selectedAge === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(isSelected ? null : age)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                    isSelected
                      ? "bg-[#ff2b75] text-white border border-[#ff2b75]"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[#ff2b75] hover:text-[#ff2b75]"
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </main>
  );
}
