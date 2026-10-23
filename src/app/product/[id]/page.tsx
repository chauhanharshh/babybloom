import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product = null;

  const numericId = parseInt(id);
  if (!isNaN(numericId)) {
    product = await prisma.product.findUnique({
      where: { id: numericId },
    });
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

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    mrp: Math.round(product.price * 1.5),
    imageUrl: product.imageUrl || "/images/products/party-frock.jpg",
    ageGroup: product.ageGroup,
    description: product.description,
  };

  return <ProductDetailsClient product={formattedProduct} />;
}
