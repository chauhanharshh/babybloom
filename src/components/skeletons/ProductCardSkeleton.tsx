export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Shimmer Image Box */}
        <div className="relative aspect-square mb-2 sm:mb-2.5 rounded-xl overflow-hidden bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50 animate-shimmer flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-pink-300">
            <svg
              className="w-4 h-4 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          {/* Discount tag placeholder */}
          <div className="absolute top-2 left-2 w-12 h-4 rounded-full bg-pink-200/70 animate-pulse" />
          {/* Wishlist icon placeholder */}
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 animate-pulse" />
        </div>

        {/* Title Lines */}
        <div className="space-y-1.5 px-0.5 mb-3">
          <div className="h-3.5 bg-gray-200/80 rounded-md w-4/5 animate-pulse" />
          <div className="h-2.5 bg-gray-100 rounded-md w-1/2 animate-pulse" />
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-2 px-0.5 mb-3">
          <div className="h-4 bg-gray-300/80 rounded-md w-14 animate-pulse" />
          <div className="h-3 bg-gray-200/70 rounded-md w-10 animate-pulse" />
        </div>
      </div>

      {/* Add to Cart Button Skeleton */}
      <div className="w-full h-8 sm:h-9 bg-pink-100/60 rounded-xl animate-pulse" />
    </div>
  );
}
