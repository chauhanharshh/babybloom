import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between md:hidden">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-28 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full flex-1 space-y-4">
        {/* Search input skeleton */}
        <div className="max-w-2xl h-11 bg-gray-100 rounded-full animate-pulse border border-gray-200/70" />

        {/* Chips skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded-full bg-gray-100 border border-gray-200/60 animate-pulse"
            />
          ))}
        </div>

        {/* Results title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-36 animate-pulse pt-2" />

        {/* Grid skeleton */}
        <ProductGridSkeleton
          count={6}
          columnsClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5"
        />
      </div>
    </main>
  );
}
