import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";

export const revalidate = 0;

export default async function BoysPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: "Boys" },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl || "/images/products/boy-set.jpg",
    ageGroup: p.ageGroup,
    description: p.description,
    mrp: Math.round(p.price * 1.5),
  }));

  return (
    <CategoryListingView
      title="Boys Wear (1-9 Years)"
      initialProducts={products}
      subcategories={["All", "T-Shirts", "Shirts", "Sets", "Jeans", "Hoodies"]}
    />
  );
}
