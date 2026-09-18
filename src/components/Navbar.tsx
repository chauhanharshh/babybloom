"use client";

import { ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button 
              className="text-primary hover:text-secondary p-2 -ml-2 mr-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-[#202157] tracking-tight leading-none flex items-center justify-center bg-white rounded-full h-10 w-10 border-2 border-primary/20 shadow-sm relative overflow-hidden">
                  <span className="absolute text-secondary/40 text-4xl -ml-2">B</span>
                  <span className="relative text-primary z-10 text-2xl ml-1">B</span>
                </span>
                <span className="font-script text-2xl text-secondary mt-1 tracking-wider">Baby Bloom</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-text hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Home</Link>
            <Link href="/boys" className="text-text hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Boys</Link>
            <Link href="/girls" className="text-text hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Girls</Link>
            <Link href="/newborn" className="text-text hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Newborn</Link>
          </div>

          <div className="flex items-center">
            <button 
              className="text-primary hover:text-secondary p-2 relative transition-transform hover:scale-110 active:scale-95"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-secondary/20 shadow-lg absolute w-full left-0 top-full">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-text hover:text-primary hover:bg-secondary/10 px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link href="/boys" onClick={() => setIsMobileMenuOpen(false)} className="block text-text hover:text-primary hover:bg-secondary/10 px-3 py-2 rounded-md text-base font-medium">Boys</Link>
            <Link href="/girls" onClick={() => setIsMobileMenuOpen(false)} className="block text-text hover:text-primary hover:bg-secondary/10 px-3 py-2 rounded-md text-base font-medium">Girls</Link>
            <Link href="/newborn" onClick={() => setIsMobileMenuOpen(false)} className="block text-text hover:text-primary hover:bg-secondary/10 px-3 py-2 rounded-md text-base font-medium">Newborn</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
