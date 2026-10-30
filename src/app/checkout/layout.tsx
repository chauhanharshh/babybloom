import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout – Complete Your BabyBloom Order",
  description:
    "Complete your BabyBloom order securely. Enter your delivery address and choose from Cash on Delivery (COD), UPI, Card, or Net Banking with fast shipping across India.",
  alternates: {
    canonical: "/checkout",
  },
  openGraph: {
    title: "Secure Checkout | BabyBloom",
    description:
      "Complete your BabyBloom order securely with COD, UPI, Card, or Net Banking.",
    url: "/checkout",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

