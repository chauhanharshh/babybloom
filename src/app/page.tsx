import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import HeroSlider from "@/components/HeroSlider";
import CategoryScrollRow from "@/components/CategoryScrollRow";
import MobileBottomNav from "@/components/MobileBottomNav";
import LazyImage from "@/components/LazyImage";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight,
  Sparkles, 
  Crown
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.babyybloom.com";

export const revalidate = 60; // Fast ISR cache (instantly revalidated on admin updates)

export const metadata: Metadata = {
  title: {
    absolute: "BabyBloom | Premium Baby & Kids Wear Online in India (0–9 Years)",
  },
  description:
    "Shop adorable, comfortable & breathable baby and kids wear online at BabyBloom. Explore newborn rompers, girls frocks, boys sets & party wear with free shipping above ₹999.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BabyBloom | Premium Baby & Kids Wear Online in India (0–9 Years)",
    description:
      "Shop adorable, comfortable & breathable baby and kids wear online at BabyBloom. Explore newborn rompers, girls frocks, boys sets & party wear.",
    url: "/",
  },
};

export default async function Home() {
  // Fetch latest products, active hero banners, active offers, and categories
  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
  type DbBanner = Awaited<ReturnType<typeof prisma.banner.findMany>>[number];
  type DbCategory = Awaited<
    ReturnType<typeof prisma.category.findMany<{ include: { subcategories: true } }>>
  >[number];

  let dbProducts: DbProduct[] = [];
  let dbBanners: DbBanner[] = [];
  let activeOffers: ActiveOffer[] = [];
  let dbCategories: DbCategory[] = [];

  try {
    const [productsRes, bannersRes, offersRes, categoriesRes] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      getActiveOffers(),
      prisma.category.findMany({
        include: { subcategories: { orderBy: { id: "asc" } } },
        orderBy: { id: "asc" },
      }),
    ]);
    dbProducts = productsRes;
    dbBanners = bannersRes;
    activeOffers = offersRes;
    dbCategories = categoriesRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load data from database on Home page (falling back to sample data):",
      (error as Error)?.message || error
    );
  }

  // Format Hero Banners from database
  const heroBanners = dbBanners.map((b) => ({
    id: b.id,
    image: b.imageUrl,
    href: b.linkUrl || "/shop",
    alt: b.alt || b.title || "Babybloom Hero Banner",
  }));

  // Display DB products directly with active offers dynamically applied
  const displayProducts = dbProducts.map((p) => {
    const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers, p.categories);
    return {
      id: p.id.toString(),
      name: p.name,
      price: offer.price,
      stock: p.stock,
      imageUrl: p.imageUrl || "",
      ageGroup: p.ageGroup,
      ageGroups: p.ageGroups,
      category: p.category,
      categories: p.categories,
      mrp: offer.mrp,
      discountPercent: offer.discountPercent,
      offerTitle: offer.appliedOffer?.title,
    };
  });

  const pastelBgs = [
    "bg-[#ffe4ec] border-[#fecdd3]",
    "bg-[#fef3c7] border-[#fde68a]",
    "bg-[#e0f2fe] border-[#bae6fd]",
    "bg-[#fce7f3] border-[#fbcfe8]",
    "bg-[#f3e8ff] border-[#e9d5ff]",
    "bg-[#ffedd5] border-[#fed7aa]",
  ];
  const knownRoutes: Record<string, string> = {
    girls: "/girls",
    boys: "/boys",
    newborn: "/newborn",
  };
  const displayCategories = dbCategories.map((c, i) => ({
    title: c.name,
    sub: c.subcategories.length > 0 ? `(${c.subcategories.length} Styles)` : "",
    href: knownRoutes[c.slug.toLowerCase()] || `/category/${c.slug}`,
    bg: pastelBgs[i % pastelBgs.length],
    image: c.imageUrl || "",
  }));

  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BabyBloom",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/apple-touch-icon.png`,
      email: "babybloom.bb2024@gmail.com",
      telephone: "+91-9520042719",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Khanna Nagar, House no. 41, Opposite Kaushik Academy",
        addressLocality: "Haridwar",
        addressRegion: "Uttarakhand",
        postalCode: "249401",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-9520042719",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "BabyBloom",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Navbar />
      <CartDrawer />

      {/* Primary SEO H1 Heading (Single H1 for Home Page) */}
      <h1 className="sr-only">
        BabyBloom – Premium Baby &amp; Kids Wear Online Store in India
      </h1>

      {/* 1. Babybloom Hero Banner Slider (Live dynamic banners from Admin Panel / DB) */}
      {heroBanners.length > 0 && <HeroSlider banners={heroBanners} />}

      {/* 2. Category Quick-Nav Row (Live dynamic categories from DB) */}
      {displayCategories.length > 0 && <CategoryScrollRow categories={displayCategories} />}

      {/* 3. "♥ Our Best Sellers ♥" Heading with "See All >" on the right */}
      {displayProducts.length > 0 && (
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

          {/* Best Sellers Grid (Responsive: 2 on mobile, 3 on tablet, 6 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

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
                <LazyImage
                  src="/images/teddy-bear.jpg"
                  alt="Cute Teddy Bear holding pink heart"
                  fill
                  loading="lazy"
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
