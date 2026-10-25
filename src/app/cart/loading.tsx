export default function CartLoading() {
  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col pb-28 md:pb-8">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-28 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        <div className="h-8 bg-gray-200 rounded-lg w-40 mb-6 hidden md:block animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs flex items-center gap-3.5"
              >
                {/* Checkbox skeleton */}
                <div className="w-5 h-5 rounded-md bg-gray-200 animate-pulse shrink-0" />

                {/* Thumbnail shimmer skeleton */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-pink-50/70 animate-shimmer border border-pink-100 shrink-0" />

                {/* Info skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-4 bg-gray-300 rounded w-16 animate-pulse" />
                    <div className="h-7 w-20 bg-pink-50 rounded-lg border border-pink-100 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Summary Box */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between">
                <div className="h-3.5 bg-gray-100 rounded w-20 animate-pulse" />
                <div className="h-3.5 bg-gray-100 rounded w-12 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3.5 bg-gray-100 rounded w-16 animate-pulse" />
                <div className="h-3.5 bg-emerald-100 rounded w-10 animate-pulse" />
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between pt-1">
                <div className="h-5 bg-gray-300 rounded w-24 animate-pulse" />
                <div className="h-5 bg-gray-300 rounded w-16 animate-pulse" />
              </div>
            </div>
            <div className="w-full h-11 bg-pink-200/60 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
