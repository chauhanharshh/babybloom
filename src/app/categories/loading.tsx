export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col pb-20 md:pb-8">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-36 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        {/* Title */}
        <div className="h-7 bg-gray-200 rounded-lg w-48 mb-4 animate-pulse" />

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50 animate-shimmer border border-pink-100 p-2 flex items-center justify-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-white/70 animate-pulse" />
              </div>
              <div className="mt-2 w-full flex flex-col items-center gap-1">
                <div className="h-3 bg-gray-200 rounded w-14 animate-pulse" />
                <div className="h-2.5 bg-gray-100 rounded w-10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Shop by Age Section */}
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-28 rounded-full bg-gray-100 border border-gray-200/80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
