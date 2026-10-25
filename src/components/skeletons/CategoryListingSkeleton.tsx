import ProductGridSkeleton from "./ProductGridSkeleton";

interface CategoryListingSkeletonProps {
  titlePlaceholder?: string;
  count?: number;
}

export default function CategoryListingSkeleton({
  titlePlaceholder = "Loading...",
  count = 8,
}: CategoryListingSkeletonProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-20 md:pb-8">
      {/* Mobile Header Bar Skeleton */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-32 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8 w-full flex-1">
        {/* Desktop Header Skeleton */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
            <div className="h-3.5 bg-gray-100 rounded w-64 animate-pulse" />
          </div>
          <div className="h-6 bg-pink-100 rounded-full w-28 animate-pulse" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex gap-2 pb-3 overflow-x-auto no-scrollbar sm:pb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-gray-100 border border-gray-200/70 animate-pulse shrink-0"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          ))}
        </div>

        {/* Controls Bar Skeleton */}
        <div className="flex justify-between items-center py-2 mb-4 border-b border-gray-100/80">
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* 8 Product Cards Grid Skeleton */}
        <ProductGridSkeleton
          count={count}
          columnsClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5"
        />
      </div>
    </main>
  );
}
