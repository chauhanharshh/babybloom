"use client";

import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Crown,
  Tag,
  Snowflake,
  Heart,
  Shirt,
  Baby,
  Layers,
  Clock,
  Footprints,
  Gift
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useCart } from "@/context/CartContext";

interface NavSubcategory {
  id: number;
  name: string;
  slug: string;
}

interface NavCategory {
  id: number;
  name: string;
  slug: string;
  subcategories?: NavSubcategory[];
}

interface NavProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  style?: string | null;
  ageGroup?: string;
  mrp?: number;
}

const DEFAULT_CATEGORIES: NavCategory[] = [
  { id: 1, name: "Girls", slug: "girls" },
  { id: 2, name: "Boys", slug: "boys" },
  { id: 4, name: "Romper", slug: "romper" },
  { id: 5, name: "Innerwear", slug: "innerwear" },
  { id: 8, name: "Thermal", slug: "thermal" },
];

const FEATURED_COLLECTIONS = [
  {
    title: "Everyday Essentials",
    subtitle: "Comfort for every day",
    image: "/images/categories/coord-sets.jpg",
    query: "essentials",
  },
  {
    title: "Party Wear",
    subtitle: "Special moments, special outfits",
    image: "/images/categories/frocks.jpg",
    query: "party wear",
  },
  {
    title: "Winter Collection",
    subtitle: "Warm & Stylish",
    image: "/images/categories/sweatshirts.jpg",
    query: "winter",
  },
  {
    title: "Summer Collection",
    subtitle: "Cool & Cozy",
    image: "/images/categories/newborn-romper.jpg",
    query: "summer",
  },
  {
    title: "Ethnic Wear",
    subtitle: "Tradition with Style",
    image: "/images/categories/girls-wear.jpg",
    query: "ethnic wear",
  },
  {
    title: "Matching Sets",
    subtitle: "Perfect Combos",
    image: "/images/categories/boys-wear.jpg",
    query: "sets",
  },
];

const POPULAR_AGE_FILTERS = [
  "0 - 6 Months",
  "6 - 12 Months",
  "1 - 2 Years",
  "2 - 3 Years",
  "3 - 4 Years",
  "4 - 6 Years",
];

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("girl")) return Heart;
  if (n.includes("boy")) return Shirt;
  if (n.includes("romper") || n.includes("baby")) return Baby;
  if (n.includes("inner")) return Layers;
  if (n.includes("thermal") || n.includes("winter")) return Snowflake;
  return Tag;
}

function getSubcategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("dress") || n.includes("frock") || n.includes("skirt")) return Sparkles;
  if (n.includes("shirt") || n.includes("top") || n.includes("t-shirt")) return Shirt;
  if (n.includes("jeans") || n.includes("pant") || n.includes("shorts")) return Layers;
  if (n.includes("romper") || n.includes("onesie") || n.includes("baby")) return Baby;
  if (n.includes("suit") || n.includes("ethnic") || n.includes("kurta") || n.includes("lehenga") || n.includes("dhoti")) return Crown;
  if (n.includes("winter") || n.includes("thermal") || n.includes("sweater") || n.includes("jacket") || n.includes("hoodie")) return Snowflake;
  if (n.includes("panty") || n.includes("innerwear") || n.includes("camisole") || n.includes("sleepwear") || n.includes("night")) return Heart;
  if (n.includes("shoe") || n.includes("footwear") || n.includes("boot") || n.includes("sock")) return Footprints;
  if (n.includes("gift") || n.includes("toy")) return Gift;
  if (n.includes("month") || n.includes("yr") || n.includes("year")) return Clock;
  return Tag;
}

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, addToCart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<number | null>(null);
  const [activeOfferText, setActiveOfferText] = useState<string | null>(null);
  const [categories, setCategories] = useState<NavCategory[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<NavProduct[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveMenu(key);
  };

  const handleMenuLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  const cancelClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Close mega menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveMenu(null);
  }

  const fetchCategories = useCallback(() => {
    fetch(`/api/categories?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 1. Fetch active promo offers for the top banner
    fetch("/api/offers?active=true")
      .then((res) => res.json())
      .then((offers) => {
        if (Array.isArray(offers) && offers.length > 0) {
          const promo =
            offers.find((o) => o.bannerText)?.bannerText ||
            `🎉 ${offers[0].title} - Flat ${offers[0].discountPercent}% OFF!`;
          setActiveOfferText(promo);
        }
      })
      .catch(() => {});

    // 2. Fetch data
    fetchCategories();
    fetchProducts();

    // Auto-refresh when user tabs back or focuses
    window.addEventListener("focus", fetchCategories);
    window.addEventListener("storage", fetchCategories);
    window.addEventListener("babybloom:categories-updated", fetchCategories);
    return () => {
      window.removeEventListener("focus", fetchCategories);
      window.removeEventListener("storage", fetchCategories);
      window.removeEventListener("babybloom:categories-updated", fetchCategories);
    };
  }, [pathname, fetchCategories, fetchProducts]);

  // Quick Add to Cart from trending cards
  const handleQuickAddToCart = (e: React.MouseEvent, p: NavProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: p.id.toString(),
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl || "/images/categories/coord-sets.jpg",
      ageGroup: p.ageGroup || "1-2 Yrs",
      category: p.category,
      mrp: p.mrp || Math.round(p.price * 1.3),
    });
    setIsCartOpen(true);
  };

  // Trending products for "Shop" mega menu
  const trendingProducts = useMemo(() => {
    if (products.length === 0) return [];
    const withImages = products.filter((p) => p.imageUrl && p.imageUrl.startsWith("http"));
    return withImages.length >= 3 ? withImages.slice(0, 3) : products.slice(0, 3);
  }, [products]);

  // Prioritize primary kids wear categories in the navbar
  const sortedCategories = useMemo(() => {
    const primaryKeywords = ["baby", "girls", "boys"];
    return [...categories].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIdx = primaryKeywords.findIndex((k) => aName.includes(k));
      const bIdx = primaryKeywords.findIndex((k) => bName.includes(k));
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Main 3 categories shown directly in top navigation (Baby Wear, Girls Wear, Boys Wear)
  // Additional categories (Innerwear, Romper, Thermal, etc.) go to "More" dropdown
  const visibleCategories = sortedCategories.slice(0, 3);
  const overflowCategories = sortedCategories.slice(3);

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-pink-100 relative"
      onMouseLeave={handleMenuLeave}
    >
      {/* Top Pink Announcement Bar */}
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-stretch h-16 sm:h-20 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Mobile menu button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              className="text-gray-700 hover:text-[#ff2b75] p-2 -ml-2 lg:hidden cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              onMouseEnter={() => setActiveMenu(null)}
              className="flex items-center gap-2.5 group shrink-0"
            >
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
          <nav className="hidden lg:flex items-stretch justify-center flex-1 min-w-0 space-x-0.5 xl:space-x-1.5 h-full">
            <Link 
              href="/" 
              onMouseEnter={() => setActiveMenu(null)}
              className="self-center bg-[#ff2b75] text-white px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold shadow-xs hover:bg-[#e01d62] transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </Link>

            {/* 1. Shop Item with Mega Menu */}
            {(() => {
              const isShopOpen = activeMenu === "shop";
              return (
                <div 
                  className={`group nav-item-group h-full flex items-center ${isShopOpen ? "is-active" : ""}`}
                  onMouseEnter={() => handleMenuEnter("shop")}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link 
                    href="/shop" 
                    className={`nav-link-trigger h-full px-2 xl:px-3 py-2 text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap border-b-2 cursor-pointer ${
                      isShopOpen 
                        ? "border-[#ff2b75] text-[#ff2b75] font-bold" 
                        : "border-transparent text-gray-700 hover:text-[#ff2b75]"
                    }`}
                  >
                    <span>Shop</span>
                    <ChevronDown 
                      size={14} 
                      className={`nav-chevron-trigger transition-transform duration-200 ${
                        isShopOpen 
                          ? "rotate-180 text-[#ff2b75]" 
                          : "text-gray-400"
                      }`} 
                    />
                  </Link>

                  {/* Shop Mega Menu Dropdown */}
                  <div 
                    className="nav-mega-menu"
                  >
                    {/* Invisible hit-area that closes dropdown when mouse moves outside */}
                    <div 
                      className="fixed inset-0 top-[64px] sm:top-[80px] bg-transparent pointer-events-auto cursor-default -z-10" 
                      onMouseEnter={() => setActiveMenu(null)}
                      onClick={() => setActiveMenu(null)}
                    />

                    <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 pt-1 pb-4 pointer-events-none">
                      <div 
                        onMouseEnter={cancelClose}
                        onMouseLeave={handleMenuLeave}
                        className="nav-mega-card bg-white rounded-2xl shadow-xl border border-pink-100/90 p-4 sm:p-5 pointer-events-auto"
                      >
                        <div className="flex gap-4 lg:gap-6">
                          
                          {/* Column 1: Shop by Category */}
                          <div className="w-[160px] lg:w-[185px] shrink-0 border-r border-gray-100 pr-3 lg:pr-4 flex flex-col justify-between">
                            <div>
                              <h3 className="text-xs sm:text-sm font-extrabold text-[#ff2b75] tracking-tight mb-2 pb-1 border-b border-pink-50 flex items-center gap-1.5">
                                Shop by Category
                              </h3>
                              <div className="space-y-0.5 overflow-y-auto max-h-[220px] no-scrollbar">
                                <Link
                                  href="/shop?sort=newest"
                                  onClick={() => setActiveMenu(null)}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                                >
                                  <span className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-[#ff2b75]" />
                                    <span>New Arrivals</span>
                                  </span>
                                  <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                                </Link>

                                <Link
                                  href="/shop?sort=featured"
                                  onClick={() => setActiveMenu(null)}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                                >
                                  <span className="flex items-center gap-2">
                                    <Crown size={14} className="text-amber-500" />
                                    <span>Best Sellers</span>
                                  </span>
                                  <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                                </Link>

                                {/* Database Categories */}
                                {categories.map((c) => {
                                  const CatIcon = getCategoryIcon(c.name);
                                  const displayName = c.name.toLowerCase().endsWith("wear") 
                                    ? c.name 
                                    : `${c.name} Wear`;
                                  return (
                                    <Link
                                      key={c.id}
                                      href={`/category/${c.slug}`}
                                      onClick={() => setActiveMenu(null)}
                                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                                    >
                                      <span className="flex items-center gap-2 truncate">
                                        <CatIcon size={14} className="text-gray-400 group-hover/item:text-[#ff2b75] transition-colors shrink-0" />
                                        <span className="truncate capitalize">{displayName}</span>
                                      </span>
                                      <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                    </Link>
                                  );
                                })}

                                <Link
                                  href="/shop?discount=sale"
                                  onClick={() => setActiveMenu(null)}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                                >
                                  <span className="flex items-center gap-2">
                                    <Tag size={14} className="text-rose-500" />
                                    <span>Sale</span>
                                  </span>
                                  <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Featured Collections */}
                          <div className="w-[190px] lg:w-[220px] shrink-0 border-r border-gray-100 pr-3 lg:pr-4 flex flex-col justify-between">
                            <div>
                              <h3 className="text-xs sm:text-sm font-extrabold text-[#ff2b75] tracking-tight mb-2 pb-1 border-b border-pink-50">
                                Featured Collections
                              </h3>
                              <div className="space-y-1 overflow-y-auto max-h-[220px] no-scrollbar">
                                {FEATURED_COLLECTIONS.slice(0, 4).map((c) => (
                                  <Link
                                    key={c.title}
                                    href={`/shop?search=${encodeURIComponent(c.query)}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-pink-50/70 transition-all group/item border border-transparent hover:border-pink-100/60"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-pink-100/40 shrink-0 border border-pink-100/70">
                                        <Image 
                                          src={c.image} 
                                          alt={c.title} 
                                          fill 
                                          sizes="32px"
                                          className="object-cover group-hover/item:scale-105 transition-transform duration-300" 
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-gray-800 group-hover/item:text-[#ff2b75] transition-colors truncate">
                                          {c.title}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                          {c.subtitle}
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all shrink-0 ml-1" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Trending Now */}
                          <div className="flex-1 pl-1 flex flex-col min-w-0 justify-between">
                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-pink-50/80">
                              <span className="text-xs font-bold text-gray-800 tracking-tight truncate">
                                Trending Now
                              </span>
                              <Link
                                href="/shop"
                                onClick={() => setActiveMenu(null)}
                                className="text-xs font-bold text-[#ff2b75] hover:text-[#e01d62] flex items-center gap-1 group/link shrink-0 ml-2"
                              >
                                View All <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                              {trendingProducts.map((p, pIdx) => (
                                <div 
                                  key={p.id} 
                                  className={`group/card flex flex-col justify-between min-w-0 ${pIdx === 2 ? "hidden lg:flex" : "flex"}`}
                                >
                                  <Link
                                    href={`/product/${p.id}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block"
                                  >
                                    <div className="relative aspect-[4/5] max-h-[120px] rounded-xl overflow-hidden bg-pink-50/30 border border-pink-100/70">
                                      <Image
                                        src={p.imageUrl || "/images/categories/coord-sets.jpg"}
                                        alt={p.name}
                                        fill
                                        sizes="140px"
                                        className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-900 mt-1 truncate group-hover/card:text-[#ff2b75] transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="text-xs font-extrabold text-[#ff2b75] mt-0.5">
                                      ₹{p.price.toLocaleString("en-IN")}
                                    </p>
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={(e) => handleQuickAddToCart(e, p)}
                                    className="w-full mt-1.5 bg-[#ff2b75] hover:bg-[#e01d62] text-white py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                                  >
                                    <ShoppingBag size={11} className="shrink-0" />
                                    <span className="truncate">Add to Cart</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Dynamic Categories with Category Mega Menus */}
            {visibleCategories.map((cat) => {
              const displayName = cat.name.toLowerCase().endsWith("wear") 
                ? cat.name 
                : `${cat.name} Wear`;
              const isCatOpen = activeMenu === cat.slug;

              // Filter products belonging strictly to this category (show up to 3 featured items)
              const catProducts = products
                .filter((p) => {
                  const pCat = (p.category || "").toLowerCase().trim();
                  const cName = (cat.name || "").toLowerCase().trim();
                  const cSlug = (cat.slug || "").toLowerCase().trim();
                  return pCat === cName || pCat === cSlug || pCat.includes(cSlug) || cSlug.includes(pCat);
                })
                .slice(0, 3);

              // Subcategories strictly from database
              const subItems = cat.subcategories || [];

              return (
                <div 
                  key={cat.id} 
                  className={`group nav-item-group h-full flex items-center ${isCatOpen ? "is-active" : ""}`}
                  onMouseEnter={() => handleMenuEnter(cat.slug)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className={`nav-link-trigger h-full px-2 xl:px-3 py-2 text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap border-b-2 cursor-pointer capitalize ${
                      isCatOpen 
                        ? "border-[#ff2b75] text-[#ff2b75] font-bold" 
                        : "border-transparent text-gray-700 hover:text-[#ff2b75]"
                    }`}
                  >
                    <span>{displayName}</span>
                    <ChevronDown 
                      size={14} 
                      className={`nav-chevron-trigger transition-transform duration-200 ${
                        isCatOpen 
                          ? "rotate-180 text-[#ff2b75]" 
                          : "text-gray-400"
                      }`} 
                    />
                  </Link>

                  {/* Category Specific Mega Menu Dropdown */}
                  <div 
                    className="nav-mega-menu"
                  >
                    {/* Invisible hit-area that closes dropdown when mouse moves outside */}
                    <div 
                      className="fixed inset-0 top-[64px] sm:top-[80px] bg-transparent pointer-events-auto cursor-default -z-10" 
                      onMouseEnter={() => setActiveMenu(null)}
                      onClick={() => setActiveMenu(null)}
                    />

                    <div className="max-w-4xl mx-auto px-4 pt-1 pb-4 pointer-events-none">
                      <div 
                        onMouseEnter={cancelClose}
                        onMouseLeave={handleMenuLeave}
                        className="nav-mega-card bg-white rounded-2xl shadow-xl border border-pink-100/90 p-4 sm:p-5 pointer-events-auto"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          
                          {/* Left Column: Subcategories ONLY from DB */}
                          <div className="w-[190px] sm:w-[210px] shrink-0 border-r border-gray-100 pr-3 sm:pr-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-pink-50">
                                <h3 className="text-xs sm:text-sm font-extrabold text-[#ff2b75] tracking-tight mb-0 capitalize truncate">
                                  {displayName}
                                </h3>
                                <Link
                                  href={`/category/${cat.slug}`}
                                  onClick={() => setActiveMenu(null)}
                                  className="text-[11px] font-bold text-gray-400 hover:text-[#ff2b75] transition-colors shrink-0"
                                >
                                  View All
                                </Link>
                              </div>

                              <div className="space-y-0.5 overflow-y-auto max-h-[220px] no-scrollbar">
                                {subItems.length > 0 ? (
                                  subItems.map((sub) => {
                                    const SubIcon = getSubcategoryIcon(sub.name);
                                    return (
                                      <Link
                                        key={sub.id}
                                        href={`/category/${cat.slug}?sub=${encodeURIComponent(sub.name)}`}
                                        onClick={() => setActiveMenu(null)}
                                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item capitalize"
                                      >
                                        <span className="flex items-center gap-2 truncate">
                                          <SubIcon size={13} className="text-gray-400 group-hover/item:text-[#ff2b75] transition-colors shrink-0" />
                                          <span className="truncate">{sub.name}</span>
                                        </span>
                                        <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all opacity-0 group-hover/item:opacity-100 shrink-0" />
                                      </Link>
                                    );
                                  })
                                ) : (
                                  <div className="py-3 px-2 text-center text-xs text-gray-400">
                                    No subcategories added
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Section: Featured in [Category Name] -> 3 Compact Cards */}
                          <div className="flex-1 pl-1 flex flex-col min-w-0 justify-between">
                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-pink-50/80">
                              <span className="text-xs font-bold text-gray-800 tracking-tight">
                                Featured in {displayName}
                              </span>
                              <Link
                                href={`/category/${cat.slug}`}
                                onClick={() => setActiveMenu(null)}
                                className="text-xs font-bold text-[#ff2b75] hover:text-[#e01d62] flex items-center gap-1 group/link"
                              >
                                View All <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
                              </Link>
                            </div>

                            {catProducts.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                                {catProducts.map((p) => (
                                  <Link
                                    key={p.id}
                                    href={`/product/${p.id}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="group/card flex flex-col min-w-0"
                                  >
                                    <div className="relative aspect-[4/5] max-h-[135px] rounded-xl overflow-hidden bg-pink-50/30 border border-pink-100/70">
                                      <Image
                                        src={p.imageUrl || "/images/categories/coord-sets.jpg"}
                                        alt={p.name}
                                        fill
                                        sizes="140px"
                                        className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors" />
                                    </div>
                                    <p className="text-[11px] sm:text-xs font-bold text-gray-900 mt-1.5 truncate group-hover/card:text-[#ff2b75] transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="text-xs font-extrabold text-[#ff2b75] mt-0.5">
                                      ₹{p.price.toLocaleString("en-IN")}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 bg-pink-50/40 rounded-xl border border-pink-100/60 text-center">
                                <Sparkles size={22} className="text-[#ff2b75] mb-1.5" />
                                <p className="text-xs font-bold text-gray-800">Explore {displayName}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 mb-2.5">Discover the newest collection</p>
                                <Link
                                  href={`/category/${cat.slug}`}
                                  onClick={() => setActiveMenu(null)}
                                  className="bg-[#ff2b75] text-white px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[#e01d62] transition-colors"
                                >
                                  Shop Now
                                </Link>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3. Overflow Categories Trigger if any */}
            {overflowCategories.length > 0 && (() => {
              const isMoreOpen = activeMenu === "more";
              return (
                <div 
                  className={`group nav-item-group h-full flex items-center relative ${isMoreOpen ? "is-active" : ""}`}
                  onMouseEnter={() => handleMenuEnter("more")}
                  onMouseLeave={handleMenuLeave}
                >
                  <button 
                    type="button"
                    className={`nav-link-trigger h-full px-2 xl:px-3 py-2 text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap border-b-2 cursor-pointer ${
                      isMoreOpen 
                        ? "border-[#ff2b75] text-[#ff2b75] font-bold" 
                        : "border-transparent text-gray-700 hover:text-[#ff2b75]"
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown 
                      size={14} 
                      className={`nav-chevron-trigger transition-transform duration-200 ${
                        isMoreOpen 
                          ? "rotate-180 text-[#ff2b75]" 
                          : "text-gray-400"
                      }`} 
                    />
                  </button>

                  {/* Sleek Floating Dropdown for More */}
                  <div 
                    onMouseEnter={cancelClose}
                    onMouseLeave={handleMenuLeave}
                    onClick={() => setActiveMenu(null)}
                    className="nav-more-dropdown w-56 pt-1 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-pink-100/90 p-2.5 space-y-1">
                      <p className="px-2.5 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        More Categories
                      </p>
                      {overflowCategories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/category/${c.slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item capitalize"
                        >
                          <span>{c.name.toLowerCase().endsWith("wear") ? c.name : `${c.name} Wear`}</span>
                          <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                        </Link>
                      ))}

                      {/* On screens where About Us & Contact are hidden from top nav bar (e.g. lg screens) */}
                      <div className="pt-2 mt-1 border-t border-gray-100 xl:hidden">
                        <p className="px-2.5 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                          Company
                        </p>
                        <Link
                          href="/faq"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                        >
                          <span>About Us</span>
                          <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          href="/shipping-returns"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#ff2b75] hover:bg-pink-50/70 transition-all group/item"
                        >
                          <span>Contact</span>
                          <ChevronRight size={12} className="text-gray-300 group-hover/item:text-[#ff2b75] group-hover/item:translate-x-0.5 transition-all" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <Link 
              href="/faq" 
              onMouseEnter={() => setActiveMenu(null)}
              className={`${overflowCategories.length > 0 ? "hidden xl:block" : "block"} self-center text-gray-700 hover:text-[#ff2b75] px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0`}
            >
              About Us
            </Link>

            <Link 
              href="/shipping-returns" 
              onMouseEnter={() => setActiveMenu(null)}
              className={`${overflowCategories.length > 0 ? "hidden xl:block" : "block"} self-center text-gray-700 hover:text-[#ff2b75] px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons (Search, User, Cart) */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3"
            onMouseEnter={() => setActiveMenu(null)}
          >
            <Link 
              href="/shop"
              className="p-2 text-gray-700 hover:text-[#ff2b75] transition-colors rounded-full hover:bg-pink-50"
              title="Search"
            >
              <Search size={21} />
            </Link>

            <Link 
              href="/faq"
              className="p-2 text-gray-700 hover:text-[#ff2b75] transition-colors rounded-full hover:bg-pink-50"
              title="Help & FAQ"
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
        <div className="lg:hidden bg-white border-b border-pink-100 shadow-xl px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
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
            Shop All Collections
          </Link>

          {/* Dynamic Categories Section */}
          <div className="pt-2 pb-1 border-t border-gray-100">
            <p className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Categories ({categories.length})
            </p>
            {categories.map((c) => {
              const hasSubs = c.subcategories && c.subcategories.length > 0;
              const isExpanded = mobileExpandedCat === c.id;
              const displayName = c.name.toLowerCase().endsWith("wear") ? c.name : `${c.name} Wear`;
              return (
                <div key={c.id} className="space-y-0.5">
                  <div className="flex items-center justify-between hover:bg-pink-50/60 rounded-xl transition-colors">
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-gray-800 hover:text-[#ff2b75] px-4 py-2 text-sm font-semibold capitalize"
                    >
                      {displayName}
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileExpandedCat(isExpanded ? null : c.id);
                        }}
                        className="p-2.5 text-gray-400 hover:text-[#ff2b75] transition-colors"
                        aria-label={`Toggle ${c.name} subcategories`}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-[#ff2b75]" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Expanded Subcategories in Mobile */}
                  {hasSubs && isExpanded && (
                    <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-pink-200 ml-4 mb-2 animate-in fade-in duration-150">
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xs font-bold text-[#ff2b75] py-1.5 px-3 rounded-lg hover:bg-pink-50/60"
                      >
                        Explore All {c.name} →
                      </Link>
                      {c.subcategories!.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${c.slug}?sub=${encodeURIComponent(sub.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-xs font-medium text-gray-600 hover:text-[#ff2b75] py-1.5 px-3 rounded-lg hover:bg-pink-50/60 capitalize"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1">
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
          </div>
        </div>
      )}
    </header>
  );
}

