export default function CategoryRowSkeleton() {
  return (
    <div className="relative w-full max-w-7xl mx-auto py-3 sm:py-6">
      <div className="flex overflow-x-auto no-scrollbar gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-8 lg:overflow-visible">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center shrink-0 w-[72px] sm:w-[84px] lg:w-auto"
          >
            {/* Box skeleton */}
            <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] lg:w-full lg:aspect-square rounded-2xl bg-gradient-to-r from-pink-50/80 via-pink-100/50 to-pink-50/80 animate-shimmer border border-pink-100/80 p-2 flex items-center justify-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-white/70 animate-pulse" />
            </div>

            {/* Label skeleton */}
            <div className="mt-2 w-full flex flex-col items-center gap-1">
              <div className="h-2.5 bg-gray-200/80 rounded w-12 animate-pulse" />
              <div className="h-2 bg-gray-100 rounded w-8 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
