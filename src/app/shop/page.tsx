import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 0;

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
