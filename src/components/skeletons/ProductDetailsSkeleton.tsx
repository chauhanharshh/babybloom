export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-4 md:py-8 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Skeleton */}
        <div className="space-y-3">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50 animate-shimmer border border-pink-100 flex items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center text-pink-300">
              <svg
                className="w-8 h-8 animate-pulse"
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
          </div>

          {/* Thumbnail row */}
          <div className="hidden md:flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-2xl bg-pink-50/70 animate-shimmer border border-pink-100/60"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Info Skeleton */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 sm:h-7 bg-gray-200/90 rounded-lg w-4/5 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-md w-1/3 animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gray-300/80 rounded-md w-24 animate-pulse" />
            <div className="h-5 bg-gray-200/60 rounded-md w-16 animate-pulse" />
            <div className="h-5 bg-pink-100 rounded-full w-20 animate-pulse" />
          </div>

          <hr className="border-gray-100" />

          {/* Size Options */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-10 rounded-xl bg-gray-100 border border-gray-200/70 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="w-full h-12 rounded-xl bg-[#ff2b75]/20 animate-pulse" />
            <div className="w-full h-12 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
