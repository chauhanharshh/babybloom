import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Boys Wear Online (1–9 Years) – T-Shirts, Sets, Jeans & Party Wear",
  description:
    "Shop stylish and comfortable boys wear for 1 to 9 years at BabyBloom. Explore trendy co-ord sets, shirts, jeans, hoodies, and ethnic outfits for boys.",
  alternates: {
    canonical: "/boys",
  },
  openGraph: {
    title: "Boys Wear Online (1–9 Years) | BabyBloom",
    description:
      "Shop stylish and comfortable boys wear for 1 to 9 years at BabyBloom. Trendy co-ord sets, shirts, jeans & party outfits.",
    url: "/boys",
  },
};

export default async function BoysPage() {
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
            { category: { equals: "Boys", mode: "insensitive" } },
            { categories: { has: "Boys" } },
            { categories: { has: "boys" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      getActiveOffers(),
      prisma.category.findFirst({
        where: { name: { equals: "Boys", mode: "insensitive" } },
        include: { subcategories: { orderBy: { id: "asc" } } },
      }),
    ]);
    dbProducts = productsRes;
    activeOffers = offersRes;
    categoryRecord = categoryRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load boys products from DB:",
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
      title="Boys Wear (1-9 Years)"
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
