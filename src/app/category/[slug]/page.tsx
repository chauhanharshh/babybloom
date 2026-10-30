import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getCategoryBySlug = cache(async (slug: string) => {
  try {
    return await prisma.category.findFirst({
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
  } catch (error) {
    console.warn("Notice: Error fetching dynamic category:", (error as Error)?.message || error);
    return null;
  }
});

function formatSlugName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();
  const canonicalUrl = ["girls", "boys", "newborn"].includes(lowerSlug)
    ? `/${lowerSlug}`
    : `/category/${lowerSlug}`;
  const displayName = formatSlugName(slug);
  const title = `${displayName} Collection – Baby & Kids Wear Online`;
  const description = `Shop premium ${displayName} collection for babies and kids online at BabyBloom. Soft, breathable fabrics with free shipping above ₹999 & easy returns.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | BabyBloom`,
      description,
      url: canonicalUrl,
    },
  };
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const fallbackName = formatSlugName(slug);

  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
  type DbCategory = Awaited<ReturnType<typeof getCategoryBySlug>>;

  let categoryRecord: DbCategory = null;
  let dbProducts: DbProduct[] = [];
  let activeOffers: ActiveOffer[] = [];

  try {
    const [catRes, productsRes, offersRes] = await Promise.all([
      getCategoryBySlug(slug),
      prisma.product.findMany({
        where: {
          OR: [
            { category: { equals: fallbackName, mode: "insensitive" } },
            { category: { equals: slug, mode: "insensitive" } },
            { categories: { has: fallbackName } },
            { categories: { has: slug.toLowerCase() } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      getActiveOffers(),
    ]);
    categoryRecord = catRes;
    dbProducts = productsRes;
    activeOffers = offersRes;
  } catch (error) {
    console.warn("Notice: Error fetching dynamic category products:", (error as Error)?.message || error);
  }

  const categoryName = categoryRecord?.name || fallbackName;

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
      title={`${categoryName} Collection`}
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
