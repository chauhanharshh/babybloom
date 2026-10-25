import HeroSliderSkeleton from "@/components/skeletons/HeroSliderSkeleton";
import CategoryRowSkeleton from "@/components/skeletons/CategoryRowSkeleton";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-16 md:pb-0">
      {/* 1. Hero Banner Skeleton */}
      <HeroSliderSkeleton />

      {/* 2. Category Quick-Nav Row Skeleton */}
      <CategoryRowSkeleton />

      {/* 3. Best Sellers Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-4 w-full">
        <div className="flex justify-between items-center mb-3 sm:mb-5">
          <div className="h-6 sm:h-8 bg-pink-100 rounded-lg w-44 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>

        {/* 6 Best Sellers Cards Skeleton */}
        <ProductGridSkeleton
          count={6}
          columnsClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4"
        />
      </section>

      {/* 4. Trust Badges Strip Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 w-full">
        <div className="bg-[#fff5f7] border border-pink-100/90 rounded-2xl p-4 shadow-xs">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-200/60 animate-pulse shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1 hidden sm:block">
                  <div className="h-3 bg-pink-200/80 rounded w-20 animate-pulse" />
                  <div className="h-2.5 bg-pink-100 rounded w-28 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Newsletter Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 w-full">
        <div className="bg-[#ffe4ec]/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-200/60 shadow-xs h-24 sm:h-28 animate-shimmer" />
      </section>
    </main>
  );
}
