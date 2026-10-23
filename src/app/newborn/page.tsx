import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";

export const revalidate = 0;

export default async function NewbornPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: "Newborn" },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl || "/images/categories/newborn-romper.jpg",
    ageGroup: p.ageGroup,
    description: p.description,
    mrp: Math.round(p.price * 1.5),
  }));

  return (
    <CategoryListingView
      title="Newborn (0-12 Months)"
      initialProducts={products}
      subcategories={["All", "Rompers", "Innerwear", "Fleece", "Bodysuits"]}
    />
  );
}
