import prisma from "@/lib/prisma";
import CategoryListingView from "@/components/CategoryListingView";

export const revalidate = 0;

export default async function GirlsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: "Girls" },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl || "/images/products/party-frock.jpg",
    ageGroup: p.ageGroup,
    description: p.description,
    mrp: Math.round(p.price * 1.5),
  }));

  return (
    <CategoryListingView
      title="Girls Wear (1-9 Years)"
      initialProducts={products}
      subcategories={["All", "Frocks", "Tops", "Sets", "Dresses"]}
    />
  );
}
