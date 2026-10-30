import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy – Fast Delivery & Easy Exchanges",
  description:
    "Learn about BabyBloom's shipping timelines across India, free delivery offers, and our hassle-free return and exchange policy for baby and kids clothes.",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-bold text-primary mb-8 font-script">Shipping & Returns</h1>
      
      <div className="space-y-8 text-text/80">
        <section>
          <h2 className="text-2xl font-bold text-secondary mb-4">Shipping Information</h2>
          <p className="mb-4">We offer standard and express shipping options. Standard shipping usually takes 5-7 business days, while express shipping takes 2-3 business days.</p>
          <p>Free standard shipping is available on all orders over ₹2000.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-secondary mb-4">Return Policy</h2>
          <p className="mb-4">We want you to be completely satisfied with your purchase. If you are not happy with your order, you can return it within 15 days of receiving it.</p>
          <p>Items must be unworn, unwashed, and have original tags attached.</p>
        </section>
      </div>
    </div>
  );
}
