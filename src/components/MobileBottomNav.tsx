"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/categories") || pathname.startsWith("/newborn") || pathname.startsWith("/girls") || pathname.startsWith("/boys") || pathname === "/shop",
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname === "/wishlist",
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      isActive: pathname === "/cart",
      badge: totalItems,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 py-1.5 px-6 flex justify-between items-center shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors relative ${
              active ? "text-[#ff2b75]" : "text-gray-600 hover:text-[#ff2b75]"
            }`}
          >
            <div className="relative">
              <Icon 
                size={20} 
                className={active ? "stroke-[2.5]" : "stroke-[1.75]"} 
                fill={active ? "currentColor" : "none"} 
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#ff2b75] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
