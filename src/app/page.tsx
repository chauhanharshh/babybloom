import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import HeroSlider from "@/components/HeroSlider";
import CategoryScrollRow from "@/components/CategoryScrollRow";
import MobileBottomNav from "@/components/MobileBottomNav";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight,
  Sparkles, 
  Crown
} from "lucide-react";

export const revalidate = 0; // Fresh inventory data

// Best seller template items matching reference image
const SAMPLE_BEST_SELLERS = [
  {
    id: "sample-1",
    name: "Beautiful Party Frock",
    price: 999,
    mrp: 1499,
    imageUrl: "/images/products/party-frock.jpg",
    ageGroup: "1-6 Yrs",
    category: "Girls",
  },
  {
    id: "sample-2",
    name: "Stylish Boy Set",
    price: 799,
    mrp: 1199,
    imageUrl: "/images/products/boy-set.jpg",
    ageGroup: "1-6 Yrs",
    category: "Boys",
  },
  {
    id: "sample-3",
    name: "Summer Floral Dress",
    price: 699,
    mrp: 999,
    imageUrl: "/images/products/floral-dress.jpg",
    ageGroup: "1-5 Yrs",
    category: "Girls",
  },
  {
    id: "sample-4",
    name: "Cute Hoodie Set",
    price: 899,
    mrp: 1299,
    imageUrl: "/images/products/hoodie-set.jpg",
    ageGroup: "2-6 Yrs",
    category: "Boys",
  },
  {
    id: "sample-5",
    name: "Denim Dungaree",
    price: 799,
    mrp: 1199,
    imageUrl: "/images/products/denim-dungaree.jpg",
    ageGroup: "1-4 Yrs",
    category: "Girls",
  },
  {
    id: "sample-6",
    name: "Fleece Wear Set",
    price: 999,
    mrp: 1499,
    imageUrl: "/images/products/fleece-set.jpg",
    ageGroup: "0-3 Yrs",
    category: "Newborn",
  },
];

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
    href: "/shop",
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
    href: "/shop",
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

export default async function Home() {
  // Fetch latest products from database (connected directly to Admin Panel)
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Display DB products directly so any additions or edits from Admin Panel reflect on homepage
  const displayProducts = dbProducts.length > 0 
    ? dbProducts.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl || "/images/products/party-frock.jpg",
        ageGroup: p.ageGroup,
        mrp: Math.round(p.price * 1.5),
      }))
    : SAMPLE_BEST_SELLERS;

  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <Navbar />
      <CartDrawer />

      {/* 1. Babybloom Hero Banner Slider */}
      <HeroSlider />

      {/* 2. Category Quick-Nav Row (Horizontally Scrollable with Right Arrow button matching Reference Mockup) */}
      <CategoryScrollRow categories={CATEGORIES} />

      {/* 3. "♥ Our Best Sellers ♥" Heading with "See All >" on the right */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-4 w-full">
        <div className="flex justify-between items-center mb-3 sm:mb-5">
          <h2 className="text-base sm:text-2xl font-extrabold text-[#ff2b75] flex items-center gap-1.5">
            <span>♥</span>
            <span className="text-gray-900">Our Best Sellers</span>
            <span>♥</span>
          </h2>
          <Link 
            href="/shop" 
            className="text-[#ff2b75] hover:text-[#e01d62] text-xs sm:text-sm font-bold flex items-center gap-0.5 hover:underline transition-colors"
          >
            <span>See All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 6 Best Sellers Grid (Responsive: 2 on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Trust / Feature Badges Strip (All 3 in 1 row with dividers matching Reference Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 w-full">
        <div className="bg-[#fff5f7] border border-pink-100/90 rounded-2xl p-2 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between divide-x divide-pink-200/60">
            
            {/* Free Shipping */}
            <div className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 flex-1 justify-center sm:justify-start">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-[#ff2b75] shadow-xs flex items-center justify-center shrink-0">
                <Truck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-bold text-gray-900 truncate">Free Shipping</p>
                <p className="text-[8px] sm:text-[11px] text-gray-500 font-medium truncate">On Orders Above ₹999</p>
              </div>
            </div>

            {/* Secure Payments */}
            <div className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 flex-1 justify-center sm:justify-start">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-[#ff2b75] shadow-xs flex items-center justify-center shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-bold text-gray-900 truncate">Secure Payments</p>
                <p className="text-[8px] sm:text-[11px] text-gray-500 font-medium truncate">100% Safe & Secure</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 flex-1 justify-center sm:justify-start">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-[#ff2b75] shadow-xs flex items-center justify-center shrink-0">
                <RotateCcw size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-bold text-gray-900 truncate">Easy Returns</p>
                <p className="text-[8px] sm:text-[11px] text-gray-500 font-medium truncate">Hassle-Free Returns</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Newsletter Section with Teddy Bear (Compact and matching Reference Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 w-full">
        <div className="bg-[#ffe4ec] rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-pink-200/60 shadow-xs relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 relative z-10">
            
            {/* Left: Teddy Bear Image + Newsletter Text */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white shadow-xs shrink-0 drop-shadow-sm">
                <Image
                  src="/images/teddy-bear.jpg"
                  alt="Cute Teddy Bear holding pink heart"
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div className="text-left flex-1 min-w-0">
                <h3 className="text-xs sm:text-lg font-extrabold text-gray-900 truncate">
                  Subscribe to our Newsletter
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 truncate">
                  Get exclusive offers, new arrivals & more!
                </p>
              </div>
            </div>

            {/* Center: Email Form */}
            <div className="w-full sm:w-auto flex-1 max-w-md">
              <NewsletterForm />
            </div>

            {/* Desktop Brand Slogan */}
            <div className="hidden lg:block shrink-0 text-right">
              <div className="flex items-center justify-end gap-1 text-[#ff2b75] mb-0.5">
                <Sparkles size={14} />
                <Crown size={16} className="text-amber-500" />
                <Sparkles size={14} />
              </div>
              <p className="font-script text-2xl text-gray-800 font-normal">
                Because
              </p>
              <p className="font-extrabold text-xs tracking-wider text-gray-900 -mt-1 uppercase">
                They Deserve The Best
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />

      {/* 7. Mobile Bottom Navigation Bar (Fixed for mobile, matches iPhone mockup) */}
      <MobileBottomNav />
    </main>
  );
}
