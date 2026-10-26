"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LazyImage from "@/components/LazyImage";

export interface CategoryItem {
  title: string;
  sub: string;
  href: string;
  bg: string;
  image: string;
}

interface CategoryScrollRowProps {
  categories: CategoryItem[];
}

export default function CategoryScrollRow({ categories }: CategoryScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) {
    return null;
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 160, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto py-3 sm:py-6">
      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 scroll-smooth lg:flex lg:justify-center lg:flex-wrap lg:overflow-visible"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="flex flex-col items-center group shrink-0 w-[72px] sm:w-[84px] lg:w-auto transition-transform hover:-translate-y-1"
          >
            {/* Category Card Box with Pastel Background */}
            <div
              className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] lg:w-full lg:aspect-square rounded-2xl ${cat.bg} border p-1.5 sm:p-2 flex flex-col items-center justify-center shadow-xs relative overflow-hidden transition-all group-hover:shadow-md`}
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
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

            {/* Category Label */}
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

      {/* Floating Right Scroll Arrow Button (Matches reference image) */}
      <button
        type="button"
        onClick={scrollRight}
        aria-label="Scroll categories right"
        className="absolute right-2 top-1/2 -translate-y-4 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff2b75] hover:scale-105 active:scale-95 transition-all lg:hidden"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
