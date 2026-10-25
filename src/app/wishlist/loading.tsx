import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function WishlistLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between md:hidden">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-28 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {/* Desktop Title Header */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-40 animate-pulse mb-1" />
            <div className="h-3.5 bg-gray-100 rounded w-56 animate-pulse" />
          </div>
          <div className="h-6 bg-pink-100 rounded-full w-24 animate-pulse" />
        </div>

        {/* 6 Product Card Skeletons */}
        <ProductGridSkeleton
          count={6}
          columnsClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5"
        />
      </div>
    </main>
  );
}
