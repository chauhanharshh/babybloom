import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop All Baby & Kids Collections Online",
  description:
    "Browse all baby and kids wear collections at BabyBloom. Shop trendy frocks, rompers, co-ord sets, hoodies, and ethnic wear for ages 0 to 9 years with free shipping above ₹999.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop All Baby & Kids Collections Online | BabyBloom",
    description:
      "Browse all baby and kids wear collections at BabyBloom. Trendy outfits for newborns, baby girls & boys.",
    url: "/shop",
  },
};

export default async function ShopPage() {
  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
  type DbCategory = Awaited<
    ReturnType<typeof prisma.category.findMany<{ include: { subcategories: true } }>>
  >[number];

  let dbProducts: DbProduct[] = [];
  let activeOffers: ActiveOffer[] = [];
  let categoriesList: DbCategory[] = [];

  try {
    const [productsRes, offersRes, categoriesRes] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      }),
      getActiveOffers(),
      prisma.category.findMany({
        include: { subcategories: { orderBy: { id: "asc" } } },
      }),
    ]);
    dbProducts = productsRes;
    activeOffers = offersRes;
    categoriesList = categoriesRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load products from DB:",
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

  const allSubNames = Array.from(
    new Set(categoriesList.flatMap((c) => c.subcategories.map((s) => s.name)))
  );

  const dynamicSubcategories = [
    "All",
    ...allSubNames,
  ];

  return (
    <CategoryListingView
      title="All Collections"
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
