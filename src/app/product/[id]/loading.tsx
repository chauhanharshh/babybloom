import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";

export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-20 md:pb-8">
      {/* Mobile Top Bar Placeholder */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
      </div>

      <ProductDetailsSkeleton />
    </main>
  );
}
