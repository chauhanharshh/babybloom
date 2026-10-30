import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist – Saved Favorite Outfits for Kids",
  description:
    "View and manage your saved favorite baby and kids wear outfits in your BabyBloom wishlist. Easily move your favorite frocks, rompers, and sets to your cart.",
  alternates: {
    canonical: "/wishlist",
  },
  openGraph: {
    title: "My Wishlist | BabyBloom",
    description:
      "View and manage your saved favorite baby and kids wear outfits in your BabyBloom wishlist.",
    url: "/wishlist",
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

