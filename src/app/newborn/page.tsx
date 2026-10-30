import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Newborn Baby Clothes Online (0–12 Months) – Soft Organic Rompers & Sets",
  description:
    "Buy ultra-soft, hypoallergenic newborn baby wear (0–12 months) online at BabyBloom. Shop breathable cotton rompers, onesies, bodysuits, and newborn gift sets.",
  alternates: {
    canonical: "/newborn",
  },
  openGraph: {
    title: "Newborn Baby Clothes Online (0–12 Months) | BabyBloom",
    description:
      "Buy ultra-soft, hypoallergenic newborn baby wear (0–12 months) online at BabyBloom. Breathable cotton rompers, onesies & sets.",
    url: "/newborn",
  },
};

export default async function NewbornPage() {
  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
  type DbCategory = Awaited<
    ReturnType<typeof prisma.category.findFirst<{ include: { subcategories: true } }>>
  >;

  let dbProducts: DbProduct[] = [];
  let activeOffers: ActiveOffer[] = [];
  let categoryRecord: DbCategory = null;

  try {
    const [productsRes, offersRes, categoryRes] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { category: { equals: "Newborn", mode: "insensitive" } },
            { categories: { has: "Newborn" } },
            { categories: { has: "newborn" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      getActiveOffers(),
      prisma.category.findFirst({
        where: { name: { equals: "Newborn", mode: "insensitive" } },
        include: { subcategories: { orderBy: { id: "asc" } } },
      }),
    ]);
    dbProducts = productsRes;
    activeOffers = offersRes;
    categoryRecord = categoryRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load newborn products from DB:",
      (error as Error)?.message || error
    );
  }

  const products = dbProducts.map((p) => {
    const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers, p.categories);
    return {
      id: p.id.toString(),
      name: p.name,
      price: offer.price,
      stock: p.stock,
      imageUrl: p.imageUrl || "",
      ageGroup: p.ageGroup,
      ageGroups: p.ageGroups,
      category: p.category,
      categories: p.categories,
      style: p.style,
      description: p.description,
      mrp: offer.mrp,
      discountPercent: offer.discountPercent,
      offerTitle: offer.appliedOffer?.title,
    };
  });

  const dynamicSubcategories = [
    "All",
    ...(categoryRecord?.subcategories?.map((s) => s.name) || []),
  ];

  return (
    <CategoryListingView
      title="Newborn Baby Wear (0-12 Months)"
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
