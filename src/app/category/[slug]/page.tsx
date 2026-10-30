import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";
import { getActiveOffers, calculateProductOffer, type ActiveOffer } from "@/lib/offers";

export const revalidate = 0;

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "Explore adorable baby and kids wear collections online at BabyBloom.",
    };
  }

  const subNames = category.subcategories?.map((s) => s.name).slice(0, 4).join(", ");
  const title = `${category.name} Collection – Baby & Kids Wear Online`;
  const description = subNames
    ? `Shop ${category.name} collection (${subNames}) for babies and kids at BabyBloom. Soft, skin-friendly fabrics with free shipping above ₹999 & easy returns.`
    : `Shop premium ${category.name} collection for babies and kids online at BabyBloom. Soft, breathable fabrics with free shipping above ₹999 & easy returns.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${title} | BabyBloom`,
      description,
      url: `/category/${category.slug}`,
      ...(category.imageUrl ? { images: [{ url: category.imageUrl, alt: category.name }] } : {}),
    },
  };
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { slug } = await params;

  type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

  const categoryRecord = await getCategoryBySlug(slug);
  let dbProducts: DbProduct[] = [];
  let activeOffers: ActiveOffer[] = [];

  if (categoryRecord) {
    try {
      const [productsRes, offersRes] = await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              {
                category: {
                  equals: categoryRecord.name,
                  mode: "insensitive",
                },
              },
              { categories: { has: categoryRecord.name } },
              { categories: { has: categoryRecord.name.toLowerCase() } },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        getActiveOffers(),
      ]);
      dbProducts = productsRes;
      activeOffers = offersRes;
    } catch (error) {
      console.warn("Notice: Error fetching dynamic category products:", (error as Error)?.message || error);
    }
  }

  if (!categoryRecord) {
    notFound();
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
    ...(categoryRecord.subcategories?.map((s) => s.name) || []),
  ];

  return (
    <CategoryListingView
      title={`${categoryRecord.name} Collection`}
      initialProducts={products}
      subcategories={dynamicSubcategories}
    />
  );
}
