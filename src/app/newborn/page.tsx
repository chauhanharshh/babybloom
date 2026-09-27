import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function NewbornPage() {
  const products = await prisma.product.findMany({
    where: { category: "Newborn" },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh] flex-1 w-full">
        {/* Page Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-primary mb-4 font-script">Newborn Essentials</h1>
          <p className="text-text/70 max-w-2xl mx-auto text-lg">The softest, gentlest clothing for your newest family member.</p>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="aspect-[3/4] bg-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary/30">
              <p className="text-text/50 font-medium">Products coming soon</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  id: product.id.toString(),
                  imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
