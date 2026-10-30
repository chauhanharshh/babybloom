import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Privacy Policy – How We Protect Your Data",
  description:
    "Read BabyBloom's Privacy Policy to learn how we collect, use, and safeguard your personal information when you shop for baby and kids clothing online.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | BabyBloom",
    description:
      "Read BabyBloom's Privacy Policy to learn how we collect, use, and safeguard your personal information.",
    url: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <Navbar />
      <CartDrawer />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#ff2b75] font-semibold">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 font-script">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-text/80">
          <p>
            At Baby Bloom, your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information when you shop our{" "}
            <Link href="/shop" className="text-[#ff2b75] font-semibold hover:underline">
              baby and kids clothing collections
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">Information We Collect</h2>
          <p>We collect information such as your name, shipping address, email address, and phone number when you place an order.</p>

          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">How We Use Your Information</h2>
          <p>We use your information strictly to process and fulfill your orders, generate GST Tax Invoices, and communicate with you about your purchase via WhatsApp or Email.</p>

          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">Data Security</h2>
          <p>Your data is stored securely and we do not share your personal information with third parties except as necessary to fulfill your order (e.g., shipping carriers).</p>
        </div>

        {/* Internal SEO Navigation Links */}
        <div className="mt-10 pt-6 border-t border-pink-100 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="text-gray-500">Helpful Pages:</span>
          <Link href="/" className="text-[#ff2b75] hover:underline">Home</Link>
          <span>•</span>
          <Link href="/shop" className="text-[#ff2b75] hover:underline">Shop All</Link>
          <span>•</span>
          <Link href="/shipping-returns" className="text-[#ff2b75] hover:underline">Shipping &amp; Returns</Link>
          <span>•</span>
          <Link href="/size-guide" className="text-[#ff2b75] hover:underline">Size Guide</Link>
          <span>•</span>
          <Link href="/faq" className="text-[#ff2b75] hover:underline">FAQ</Link>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
