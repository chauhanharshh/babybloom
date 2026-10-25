import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { slug } = await params;

  type DbCategory = Awaited<
    ReturnType<typeof prisma.category.findFirst<{ include: { subcategories: true } }>>
  >;
  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

  let categoryRecord: DbCategory = null;
  let dbProducts: DbProduct[] = [];
  let activeOffers: ActiveOffer[] = [];

  try {
    categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug.toLowerCase() },
          { name: { equals: slug, mode: "insensitive" } },
        ],
      },
      include: {
        subcategories: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (categoryRecord) {
      const [productsRes, offersRes] = await Promise.all([
        prisma.product.findMany({
          where: {
            category: {
              equals: categoryRecord.name,
              mode: "insensitive",
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        getActiveOffers(),
      ]);
      dbProducts = productsRes;
      activeOffers = offersRes;
    }
  } catch (error) {
    console.warn("Notice: Error fetching dynamic category:", (error as Error)?.message || error);
  }

  if (!categoryRecord) {
    notFound();
  }

  const products = dbProducts.map((p) => {
    const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers);
    return {
      id: p.id.toString(),
      name: p.name,
      price: offer.price,
      imageUrl: p.imageUrl || "/images/products/party-frock.jpg",
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
    ...(categoryRecord.subcategories?.length
      ? categoryRecord.subcategories.map((s) => s.name)
      : ["Regular", "Casual", "Party Wear"]),
  ];

  return (
    <CategoryListingView
      title={`${categoryRecord.name} Collection`}
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
