import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";
import { getActiveOffers, calculateProductOffer } from "@/lib/offers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.babyybloom.com";

export const revalidate = 60;

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

  const ageLabel =
    product.ageGroups && product.ageGroups.length > 0
      ? product.ageGroups.join(", ")
      : product.ageGroup || "Kids";

  const title = `Buy ${product.name} Online (${product.category})`;
  const rawDesc =
    product.description?.trim() ||
    `Buy ${product.name} at ₹${product.price} online at BabyBloom. Premium ${product.category} kids wear for ${ageLabel}, crafted from soft, breathable cotton fabric.`;
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
  const [product, activeOffers] = await Promise.all([
    getProductById(id),
    getActiveOffers(),
  ]);

  // If not found in DB, return 404
  if (!product) {
    notFound();
  }

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
    stock: product.stock,
    mrp: offer.mrp,
    discountPercent: offer.discountPercent,
    imageUrl: product.imageUrl || "",
    ageGroup: product.ageGroup,
    ageGroups: product.ageGroups || [],
    category: product.category,
    categories: product.categories || [],
    description: product.description,
  };

  const categoryPath =
    ["girls", "boys", "newborn"].includes((product.category || "").toLowerCase())
      ? `/${product.category.toLowerCase()}`
      : `/category/${encodeURIComponent((product.category || "shop").toLowerCase())}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: `BB-${product.id}`,
      url: `${SITE_URL}/product/${product.id}`,
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
        url: `${SITE_URL}/product/${product.id}`,
        priceCurrency: "INR",
        price: offer.price,
        itemCondition: "https://schema.org/NewCondition",
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "BabyBloom",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: product.category || "Shop",
          item: `${SITE_URL}${categoryPath}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: `${SITE_URL}/product/${product.id}`,
        },
      ],
    },
  ];

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
