import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Baby & Kids Clothing Size Guide (Newborn to 6 Years)",
  description:
    "Use BabyBloom's baby and kids size chart with height (cm) and weight (kg) measurements to find the perfect fit from Newborn (0–3M) up to 6 years.",
  alternates: {
    canonical: "/size-guide",
  },
  openGraph: {
    title: "Baby & Kids Clothing Size Guide | BabyBloom",
    description:
      "Use BabyBloom's baby and kids size chart with height and weight measurements to find the perfect fit.",
    url: "/size-guide",
  },
};

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      <Navbar />
      <CartDrawer />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#ff2b75] font-semibold">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Size Guide</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 font-script">Size Guide</h1>

        <div className="prose max-w-none text-text/80">
          <p className="mb-8">
            Use our size guide below to find the perfect fit for your little one across our{" "}
            <Link href="/newborn" className="text-[#ff2b75] font-semibold hover:underline">Newborn</Link>,{" "}
            <Link href="/girls" className="text-[#ff2b75] font-semibold hover:underline">Girls</Link>, and{" "}
            <Link href="/boys" className="text-[#ff2b75] font-semibold hover:underline">Boys</Link> collections.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/10">
                  <th className="p-4 border-b border-secondary/20 font-bold text-primary">Age / Size</th>
                  <th className="p-4 border-b border-secondary/20 font-bold text-primary">Height (cm)</th>
                  <th className="p-4 border-b border-secondary/20 font-bold text-primary">Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-secondary/10">Newborn (0-3M)</td>
                  <td className="p-4 border-b border-secondary/10">50 - 62</td>
                  <td className="p-4 border-b border-secondary/10">3 - 6</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-secondary/10">3-6 Months</td>
                  <td className="p-4 border-b border-secondary/10">62 - 68</td>
                  <td className="p-4 border-b border-secondary/10">6 - 8</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-secondary/10">6-12 Months</td>
                  <td className="p-4 border-b border-secondary/10">68 - 80</td>
                  <td className="p-4 border-b border-secondary/10">8 - 10</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-secondary/10">1-2 Years</td>
                  <td className="p-4 border-b border-secondary/10">80 - 92</td>
                  <td className="p-4 border-b border-secondary/10">10 - 14</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-secondary/10">2-4 Years</td>
                  <td className="p-4 border-b border-secondary/10">92 - 104</td>
                  <td className="p-4 border-b border-secondary/10">14 - 17</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-secondary/10">4-6 Years</td>
                  <td className="p-4 border-b border-secondary/10">104 - 116</td>
                  <td className="p-4 border-b border-secondary/10">17 - 21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Internal SEO Navigation Links */}
        <div className="mt-10 pt-6 border-t border-pink-100 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="text-gray-500">Shop by Category:</span>
          <Link href="/shop" className="text-[#ff2b75] hover:underline">All Collections</Link>
          <span>•</span>
          <Link href="/newborn" className="text-[#ff2b75] hover:underline">Newborn (0–12M)</Link>
          <span>•</span>
          <Link href="/girls" className="text-[#ff2b75] hover:underline">Girls Wear</Link>
          <span>•</span>
          <Link href="/boys" className="text-[#ff2b75] hover:underline">Boys Wear</Link>
          <span>•</span>
          <Link href="/shipping-returns" className="text-[#ff2b75] hover:underline">Shipping &amp; Returns</Link>
          <span>•</span>
          <Link href="/faq" className="text-[#ff2b75] hover:underline">FAQ</Link>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
