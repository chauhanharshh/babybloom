export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Skeleton */}
      <div className="bg-gradient-to-r from-pink-500/80 to-[#ff2b75]/80 rounded-2xl p-6 text-white h-32 animate-pulse" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-6 bg-gray-300 rounded w-16 animate-pulse" />
              <div className="h-2.5 bg-gray-100 rounded w-20 animate-pulse" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Two Columns Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
