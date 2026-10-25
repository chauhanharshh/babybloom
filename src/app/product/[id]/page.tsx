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
    console.warn(
      "Notice: Could not fetch product from DB (falling back to sample):",
      (error as Error)?.message || error
    );
  }

  // Fallback to sample item if not found in DB
  if (!product) {
    product = {
      id: 1,
      name: "Beautiful Party Frock",
      price: 999,
      stock: 20,
      category: "Girls",
      ageGroup: "1-6 Yrs",
      description: "Exquisite layered party frock with soft cotton lining, premium lace finish, and delicate bow details. Perfect for birthdays, weddings, and festive celebrations.",
      imageUrl: "/images/products/party-frock.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const activeOffers = await getActiveOffers();
  const offer = calculateProductOffer(product.id, product.category, product.price, activeOffers);

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    price: offer.price,
    mrp: offer.mrp,
    discountPercent: offer.discountPercent,
    imageUrl: product.imageUrl || "/images/products/party-frock.jpg",
    ageGroup: product.ageGroup,
    description: product.description,
  };

  return <ProductDetailsClient product={formattedProduct} />;
}
