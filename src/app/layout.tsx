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

export const metadata: Metadata = {
  title: "Baby Bloom | Premium Baby & Kids Wear",
  description: "Everyday outfits for your little trendsetters. Clothes for 1-6 years.",
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
