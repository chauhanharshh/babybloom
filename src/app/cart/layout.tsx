import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Shopping Cart – Review Your Baby & Kids Outfits",
  description:
    "Review the baby and kids wear items in your BabyBloom shopping cart, apply discount coupons, and proceed to fast, secure checkout with free shipping above ₹999.",
  alternates: {
    canonical: "/cart",
  },
  openGraph: {
    title: "My Shopping Cart | BabyBloom",
    description:
      "Review the baby and kids wear items in your BabyBloom shopping cart and proceed to secure checkout.",
    url: "/cart",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

