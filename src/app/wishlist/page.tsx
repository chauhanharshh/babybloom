"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, totalItems } = useCart();

  return (
    <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Screen 6 Mobile Header */}
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
          <div className="w-6 h-6 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="22" r="18" fill="#ff4d88" />
              <circle cx="76" cy="40" r="18" fill="#ff4d88" />
              <circle cx="66" cy="74" r="18" fill="#ff4d88" />
              <circle cx="34" cy="74" r="18" fill="#ff4d88" />
              <circle cx="24" cy="40" r="18" fill="#ff4d88" />
              <circle cx="50" cy="50" r="14" fill="#fcd34d" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#ff2b75] tracking-tight">Babybloom</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-1 text-gray-700 hover:text-[#ff2b75]">
            <Search size={20} />
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {/* Desktop Title Header */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Wishlist</h1>
            <p className="text-xs text-gray-500 mt-1">Saved favorites for your little trendsetter</p>
          </div>
          <span className="bg-pink-50 text-[#ff2b75] font-bold text-xs px-3 py-1 rounded-full">
            {wishlist.length} Items Saved
          </span>
        </div>

        {/* Mobile Title */}
        <div className="md:hidden mb-3">
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
            My Wishlist <span className="font-semibold text-gray-500">({wishlist.length} Items)</span>
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto">
              <Heart size={30} />
            </div>
            <p className="font-bold text-gray-800 text-base">Your wishlist is empty</p>
            <p className="text-xs text-gray-500">Save items you love by tapping the heart icon on any product!</p>
            <Link
              href="/categories"
              className="inline-block mt-2 bg-[#ff2b75] hover:bg-[#e01d62] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          /* Responsive Product Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {wishlist.map((product) => (
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
