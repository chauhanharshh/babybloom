import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) – Shipping, Tracking & Fabrics",
  description:
    "Find answers to common questions about BabyBloom baby and kids wear, shipping across India, order tracking via WhatsApp & email, and hypoallergenic cotton fabrics.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | BabyBloom",
    description:
      "Find answers to common questions about BabyBloom baby and kids wear, shipping, order tracking & fabric safety.",
    url: "/faq",
  },
};

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you ship internationally?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, we only ship within India. We hope to expand internationally soon!",
        },
      },
      {
        "@type": "Question",
        name: "How do I track my order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Once your order ships, you will receive a tracking link via email and WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "Are your materials safe for sensitive skin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all our clothes are made from high-quality, breathable cotton and organic fabrics that are gentle on baby skin.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <CartDrawer />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#ff2b75] font-semibold">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">FAQ</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 font-script">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6 text-text/80">
          <div className="border border-secondary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-secondary mb-2">Do you ship internationally?</h2>
            <p>
              Currently, we only ship within India. Check our{" "}
              <Link href="/shipping-returns" className="text-[#ff2b75] font-semibold hover:underline">
                Shipping &amp; Returns Policy
              </Link>{" "}
              for delivery timelines across India.
            </p>
          </div>

          <div className="border border-secondary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-secondary mb-2">How do I track my order?</h2>
            <p>Once your order ships, you will receive a tracking link and GST Tax Invoice via email and WhatsApp.</p>
          </div>

          <div className="border border-secondary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-secondary mb-2">Are your materials safe for sensitive skin?</h2>
            <p>
              Yes, all our{" "}
              <Link href="/newborn" className="text-[#ff2b75] font-semibold hover:underline">
                Newborn Baby Wear
              </Link>
              ,{" "}
              <Link href="/girls" className="text-[#ff2b75] font-semibold hover:underline">
                Girls Wear
              </Link>
              , and{" "}
              <Link href="/boys" className="text-[#ff2b75] font-semibold hover:underline">
                Boys Wear
              </Link>{" "}
              are made from high-quality, breathable cotton and organic fabrics that are gentle on baby skin.
            </p>
          </div>
        </div>

        {/* Internal SEO Navigation Links */}
        <div className="mt-10 pt-6 border-t border-pink-100 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="text-gray-500">Explore BabyBloom:</span>
          <Link href="/shop" className="text-[#ff2b75] hover:underline">Shop All Collections</Link>
          <span>•</span>
          <Link href="/newborn" className="text-[#ff2b75] hover:underline">Newborn Clothes</Link>
          <span>•</span>
          <Link href="/girls" className="text-[#ff2b75] hover:underline">Girls Wear</Link>
          <span>•</span>
          <Link href="/boys" className="text-[#ff2b75] hover:underline">Boys Wear</Link>
          <span>•</span>
          <Link href="/size-guide" className="text-[#ff2b75] hover:underline">Size Guide</Link>
          <span>•</span>
          <Link href="/shipping-returns" className="text-[#ff2b75] hover:underline">Shipping &amp; Returns</Link>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
