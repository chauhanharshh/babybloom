export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-gray-50/70 flex flex-col pb-12">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden shadow-xs">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 bg-pink-100 rounded-md w-24 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1">
        <div className="h-8 bg-gray-200 rounded-lg w-40 mb-6 hidden md:block animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Address Skeleton */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="h-5 bg-gray-200 rounded w-36 animate-pulse" />
              <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
            </div>

            {/* Payment Method Skeleton */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="h-5 bg-gray-200 rounded w-36 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
              <div className="h-5 bg-gray-200 rounded w-36 animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 rounded animate-pulse pt-2" />
              </div>
              <div className="h-12 bg-pink-200/60 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
