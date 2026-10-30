import type { Metadata } from "next";
import { Outfit, Great_Vibes } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://babybloom.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BabyBloom | Premium Baby & Kids Wear Online in India",
    template: "%s | BabyBloom",
  },
  description:
    "Shop adorable, comfortable & hypoallergenic baby and kids clothing online at BabyBloom. Everyday outfits, party wear, rompers & sets for newborns to 9 years.",
  keywords: [
    "baby clothes online india",
    "kids wear",
    "newborn baby clothes",
    "girls frocks",
    "boys ethnic wear",
    "baby rompers",
    "BabyBloom",
    "children clothing store",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "BabyBloom",
    title: "BabyBloom | Premium Baby & Kids Wear Online in India",
    description:
      "Everyday outfits & special occasion wear for your little trendsetters (0 to 9 years). Soft organic cotton fabrics with free shipping above ₹999.",
    images: [
      {
        url: "/images/banners/babybloom-hero-banner.png",
        width: 1200,
        height: 630,
        alt: "BabyBloom Kids Fashion Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BabyBloom | Premium Baby & Kids Wear Online in India",
    description:
      "Shop trendy, soft & comfortable clothing for newborns, baby girls, and boys at BabyBloom.",
    images: ["/images/banners/babybloom-hero-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/favicon.ico",
  },
  manifest: "/icons/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${greatVibes.variable} font-sans antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
