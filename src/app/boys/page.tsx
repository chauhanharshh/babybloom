import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 0;

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
        where: { category: "Boys" },
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
    const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers);
    return {
      id: p.id.toString(),
      name: p.name,
      price: offer.price,
      imageUrl: p.imageUrl || "",
      ageGroup: p.ageGroup,
      category: p.category,
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
