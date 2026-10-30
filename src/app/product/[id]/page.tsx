import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";
import { getActiveOffers, calculateProductOffer } from "@/lib/offers";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

const getProductById = cache(async (id: string) => {
  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    return await prisma.product.findUnique({
      where: { id: numericId },
    });
  } catch (error) {
    console.warn("Notice: Could not fetch product from DB:", (error as Error)?.message || error);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "Explore premium baby and kids wear online at BabyBloom.",
    };
  }

  const activeOffers = await getActiveOffers();
  const offer = calculateProductOffer(
    product.id,
    product.category,
    product.price,
    activeOffers,
    product.categories
  );

  const ageLabel =
    product.ageGroups && product.ageGroups.length > 0
      ? product.ageGroups.join(", ")
      : product.ageGroup || "Kids";

  const title = `Buy ${product.name} Online (${product.category})`;
  const rawDesc =
    product.description?.trim() ||
    `Buy ${product.name} at ₹${offer.price} online at BabyBloom. Premium ${product.category} kids wear for ${ageLabel}, crafted from soft, breathable cotton fabric.`;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: `${title} | BabyBloom`,
      description,
      url: `/product/${product.id}`,
      ...(product.imageUrl ? { images: [{ url: product.imageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | BabyBloom`,
      description,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  // If not found in DB, return 404
  if (!product) {
    notFound();
  }

  const activeOffers = await getActiveOffers();
  const offer = calculateProductOffer(
    product.id,
    product.category,
    product.price,
    activeOffers,
    product.categories
  );

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    price: offer.price,
    mrp: offer.mrp,
    discountPercent: offer.discountPercent,
    imageUrl: product.imageUrl || "",
    ageGroup: product.ageGroup,
    ageGroups: product.ageGroups || [],
    category: product.category,
    categories: product.categories || [],
    description: product.description,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    description:
      product.description ||
      `Crafted with love from hypoallergenic breathable organic fabrics for ${product.ageGroup || "kids"}.`,
    brand: {
      "@type": "Brand",
      name: "BabyBloom",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: offer.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={formattedProduct} />
    </>
  );
}
