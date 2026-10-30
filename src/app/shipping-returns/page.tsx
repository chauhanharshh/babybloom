import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy – Fast Delivery & Easy Exchanges",
  description:
    "Learn about BabyBloom's shipping timelines across India, free delivery offers above ₹999, and our hassle-free return and exchange policy for baby and kids clothes.",
  alternates: {
    canonical: "/shipping-returns",
  },
  openGraph: {
    title: "Shipping & Returns Policy | BabyBloom",
    description:
      "Learn about BabyBloom's shipping timelines across India and our hassle-free return policy.",
    url: "/shipping-returns",
  },
};

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <Navbar />
      <CartDrawer />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#ff2b75] font-semibold">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Shipping &amp; Returns</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 font-script">
          Shipping &amp; Returns
        </h1>

        <div className="space-y-8 text-text/80">
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">Shipping Information</h2>
            <p className="mb-4">
              We offer standard and express shipping options across India. Standard shipping usually takes 5-7 business days, while express shipping takes 2-3 business days.
            </p>
            <p>Free standard shipping is available on all orders over ₹999.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">Return Policy</h2>
            <p className="mb-4">
              We want you to be completely satisfied with your purchase. If you are not happy with your order, you can return or exchange it within 15 days of receiving it. Check our{" "}
              <Link href="/size-guide" className="text-[#ff2b75] font-semibold hover:underline">
                Size Guide
              </Link>{" "}
              before ordering to find the best fit.
            </p>
            <p>Items must be unworn, unwashed, and have original tags attached.</p>
          </section>
        </div>

        {/* Internal SEO Navigation Links */}
        <div className="mt-10 pt-6 border-t border-pink-100 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="text-gray-500">Quick Links:</span>
          <Link href="/shop" className="text-[#ff2b75] hover:underline">Shop All</Link>
          <span>•</span>
          <Link href="/newborn" className="text-[#ff2b75] hover:underline">Newborn Wear</Link>
          <span>•</span>
          <Link href="/girls" className="text-[#ff2b75] hover:underline">Girls Wear</Link>
          <span>•</span>
          <Link href="/boys" className="text-[#ff2b75] hover:underline">Boys Wear</Link>
          <span>•</span>
          <Link href="/size-guide" className="text-[#ff2b75] hover:underline">Size Guide</Link>
          <span>•</span>
          <Link href="/faq" className="text-[#ff2b75] hover:underline">FAQ</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="text-[#ff2b75] hover:underline">Privacy Policy</Link>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
