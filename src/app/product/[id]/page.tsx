import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";
import { getActiveOffers, calculateProductOffer } from "@/lib/offers";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product = null;

  try {
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      product = await prisma.product.findUnique({
        where: { id: numericId },
      });
    }
  } catch (error) {
    console.warn("Notice: Could not fetch product from DB:", (error as Error)?.message || error);
  }

  // If not found in DB, return 404
  if (!product) {
    notFound();
  }

  const activeOffers = await getActiveOffers();
  const offer = calculateProductOffer(product.id, product.category, product.price, activeOffers);

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    price: offer.price,
    mrp: offer.mrp,
    discountPercent: offer.discountPercent,
    imageUrl: product.imageUrl || "",
    ageGroup: product.ageGroup,
    description: product.description,
  };

  return <ProductDetailsClient product={formattedProduct} />;
}
