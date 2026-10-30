import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Girls Wear Online (1–9 Years) – Frocks, Dresses, Co-ord Sets & Party Wear",
  description:
    "Discover adorable girls wear for 1 to 9 years at BabyBloom. Shop party frocks, cotton dresses, co-ord sets, and festive ethnic wear made from gentle fabrics.",
  alternates: {
    canonical: "/girls",
  },
  openGraph: {
    title: "Girls Wear Online (1–9 Years) | BabyBloom",
    description:
      "Discover adorable girls wear for 1 to 9 years at BabyBloom. Shop party frocks, cotton dresses & co-ord sets.",
    url: "/girls",
  },
};

export default async function GirlsPage() {
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
            { category: { equals: "Girls", mode: "insensitive" } },
            { categories: { has: "Girls" } },
            { categories: { has: "girls" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      getActiveOffers(),
      prisma.category.findFirst({
        where: { name: { equals: "Girls", mode: "insensitive" } },
        include: { subcategories: { orderBy: { id: "asc" } } },
      }),
    ]);
    dbProducts = productsRes;
    activeOffers = offersRes;
    categoryRecord = categoryRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load girls products from DB:",
      (error as Error)?.message || error
    );
  }

  const products = dbProducts.map((p) => {
    const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers, p.categories);
    return {
      id: p.id.toString(),
      name: p.name,
      price: offer.price,
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
      title="Girls Wear (1-9 Years)"
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
