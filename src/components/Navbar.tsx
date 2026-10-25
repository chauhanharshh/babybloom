"use client";

import { ShoppingBag, Search, User, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeOfferText, setActiveOfferText] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/offers?active=true")
      .then((res) => res.json())
      .then((offers) => {
        if (Array.isArray(offers) && offers.length > 0) {
          const promo = offers.find((o) => o.bannerText)?.bannerText ||
            `🎉 ${offers[0].title} - Flat ${offers[0].discountPercent}% OFF!`;
          setActiveOfferText(promo);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-pink-100">
      {/* Top Pink Announcement Bar (Matching Reference Mockup & Live Offers) */}
      <div className="bg-[#ff2b75] text-white py-1.5 px-3 sm:px-6 text-center text-xs font-semibold tracking-wide flex items-center justify-between sm:justify-center gap-2">
        <span className="text-white/80 hover:text-white cursor-pointer px-1 text-sm font-bold sm:hidden">&lt;</span>
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 truncate">
          {activeOfferText ? (
            <span className="font-extrabold tracking-normal flex items-center gap-1.5">
              <span>★</span>
              <span className="truncate">{activeOfferText}</span>
              <span>★</span>
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                <path d="M15 18H9"></path>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.24-4.05a1 1 0 0 0-.78-.38H14v8h1"></path>
                <circle cx="17" cy="18" r="2"></circle>
                <circle cx="7" cy="18" r="2"></circle>
              </svg>
              <span>Free Shipping on Orders Above ₹999</span>
              <span className="opacity-70 hidden sm:inline">|</span>
              <span className="hidden sm:inline">♥ Easy Returns</span>
              <span className="opacity-70 hidden sm:inline">|</span>
              <span className="hidden sm:inline">♥ Happy Kids, Happy Parents!</span>
            </>
          )}
        </div>
        <span className="text-white/80 hover:text-white cursor-pointer px-1 text-sm font-bold sm:hidden">&gt;</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Mobile menu button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="text-gray-700 hover:text-[#ff2b75] p-2 -ml-2 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105 rounded-full overflow-hidden shadow-2xs border border-pink-100/60 bg-white">
                <Image
                  src="/icons/apple-touch-icon.png"
                  alt="Babybloom Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#ff2b75] tracking-tight leading-none">
                  Babybloom
                </span>
                <span className="text-[10px] font-bold text-gray-700 tracking-wider flex items-center gap-1 mt-0.5">
                  Kids Fashion Store
                  <svg width="45" height="6" viewBox="0 0 50 8" fill="none" className="text-[#ff2b75]">
                    <path d="M1 5 Q25 0 49 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link 
              href="/" 
              className="bg-[#ff2b75] text-white px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold shadow-xs hover:bg-[#e01d62] transition-colors"
            >
              Home
            </Link>

            <Link 
              href="/shop" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1"
            >
              Shop <ChevronDown size={14} className="text-gray-400" />
            </Link>

            <Link 
              href="/newborn" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1"
            >
              Baby Wear <ChevronDown size={14} className="text-gray-400" />
            </Link>

            <Link 
              href="/girls" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1"
            >
              Girls Wear <ChevronDown size={14} className="text-gray-400" />
            </Link>

            <Link 
              href="/boys" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1"
            >
              Boys Wear <ChevronDown size={14} className="text-gray-400" />
            </Link>

            <Link 
              href="/faq" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors"
            >
              About Us
            </Link>

            <Link 
              href="/shipping-returns" 
              className="text-gray-700 hover:text-[#ff2b75] px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons (Search, User, Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link 
              href="/shop"
              className="p-2 text-gray-700 hover:text-[#ff2b75] transition-colors rounded-full hover:bg-pink-50"
              title="Search"
            >
              <Search size={21} />
            </Link>

            <Link 
              href="/admin"
              className="p-2 text-gray-700 hover:text-[#ff2b75] transition-colors rounded-full hover:bg-pink-50"
              title="Account / Admin"
            >
              <User size={21} />
            </Link>

            <Link 
              href="/cart"
              className="p-2 text-gray-700 hover:text-[#ff2b75] relative transition-transform hover:scale-105 active:scale-95 rounded-full hover:bg-pink-50"
              aria-label="View Cart"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-[#ff2b75] rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-pink-100 shadow-xl px-4 py-4 space-y-2">
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block bg-[#ff2b75] text-white px-4 py-2.5 rounded-full text-sm font-bold text-center"
          >
            Home
          </Link>
          <Link 
            href="/shop" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Shop All
          </Link>
          <Link 
            href="/newborn" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Baby Wear (Newborn)
          </Link>
          <Link 
            href="/girls" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Girls Wear
          </Link>
          <Link 
            href="/boys" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Boys Wear
          </Link>
          <Link 
            href="/faq" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            About Us / FAQ
          </Link>
          <Link 
            href="/shipping-returns" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Contact & Shipping
          </Link>
          <div className="pt-2 border-t border-pink-100">
            <Link 
              href="/admin" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-2 text-[#ff2b75] bg-pink-50 hover:bg-pink-100 px-4 py-2.5 rounded-lg text-sm font-bold"
            >
              <User size={18} />
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

