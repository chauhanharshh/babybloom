"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, ShoppingCart, BadgePercent, LogOut, Menu, X, FolderTree } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 w-full fixed top-0 z-20">
        <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs shrink-0">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="Babybloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <span>BabyBloom</span>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-gray-200 hidden md:flex">
          <Link href="/admin" className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs shrink-0">
              <Image
                src="/icons/apple-touch-icon.png"
                alt="Babybloom Logo"
                fill
                className="object-contain"
              />
            </div>
            <span>BabyBloom</span>
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <FolderTree className="w-5 h-5" />
            <span className="font-medium">Categories</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/offers-banners" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <BadgePercent className="w-5 h-5" />
            <span className="font-medium">Offers & Banners</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
