export default function HeroSliderSkeleton() {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      <div className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] md:aspect-[3/1] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-pink-100/70 via-pink-200/50 to-pink-100/70 animate-shimmer border border-pink-200/50 shadow-xs flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-pink-300">
          <div className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-2xs flex items-center justify-center animate-pulse">
            <svg
              className="w-6 h-6 text-pink-400"
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
          <div className="h-3.5 bg-white/60 rounded-md w-32 animate-pulse" />
        </div>

        {/* Shimmer dots indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-white/90" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}
