import { IndianRupee, ShoppingBag, Package, Clock, BadgePercent, FolderTree } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import LazyImage from "@/components/LazyImage";

export const revalidate = 0;

export default async function AdminDashboard() {
  // Real data from DB
  type OrderWithItems = Awaited<ReturnType<typeof prisma.order.findMany<{ include: { items: true } }>>>[number];
  type RecentProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

  let orders: OrderWithItems[] = [];
  let recentProducts: RecentProduct[] = [];
  let activeBannersCount = 0;
  let activeOffersCount = 0;
  let totalProductsCount = 0;

  try {
    const [ordersRes, recentProductsRes, bannersCountRes, offersCountRes, productsCountRes] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: 5,
      }),
      prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.offer.count({ where: { isActive: true } }),
      prisma.product.count(),
    ]);
    orders = ordersRes;
    recentProducts = recentProductsRes;
    activeBannersCount = bannersCountRes;
    activeOffersCount = offersCountRes;
    totalProductsCount = productsCountRes;
  } catch (error) {
    console.warn(
      "Notice: Could not load data from DB for Admin dashboard:",
      (error as Error)?.message || error
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === "approved")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const approvedCount = orders.filter((o) => o.status === "approved").length;

  const stats = [
    {
      name: "Approved Revenue",
      value: `₹${totalRevenue.toFixed(0)}`,
      icon: IndianRupee,
      sub: `${approvedCount} approved order${approvedCount !== 1 ? "s" : ""}`,
      color: "text-green-600",
    },
    {
      name: "Total Orders",
      value: orders.length.toString(),
      icon: ShoppingBag,
      sub: `${pendingCount} pending`,
      color: "text-yellow-600",
    },
    {
      name: "Total Products",
      value: totalProductsCount.toString(),
      icon: Package,
      sub: "In your catalog",
      color: "text-blue-600",
    },
    {
      name: "Offers & Banners",
      value: `${activeOffersCount} Offers`,
      icon: BadgePercent,
      sub: `${activeBannersCount} Live Hero Banners`,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Live Data</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.color}`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-pink-500 to-[#ff2b75] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <BadgePercent className="w-5 h-5" />
              Offers & Hero Banners
            </h2>
            <p className="text-xs text-white/90">
              Hero slider aur discount offers manage karein.
            </p>
          </div>
          <Link
            href="/admin/offers-banners"
            className="bg-white text-primary hover:bg-pink-50 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors shrink-0"
          >
            Manage Offers →
          </Link>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              Categories & Subcategories
            </h2>
            <p className="text-xs text-white/90">
              Nayi categories aur unke subcategories create karein.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="bg-white text-indigo-700 hover:bg-indigo-50 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors shrink-0"
          >
            Manage Categories →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Real Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet. Orders will appear here as customers place orders.</p>
            ) : (
              orders.slice(0, 5).map((order) => {
                let displayName = order.customerName;
                try {
                  if (order.customerName && order.customerName.startsWith("{")) {
                    displayName = JSON.parse(order.customerName).name || "Customer";
                  }
                } catch {}

                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Order #{order.id}</span>
                        <span className="text-xs font-medium text-gray-600">({displayName})</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">₹{order.total.toFixed(0)}</div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : order.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Database Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No products found. Add some to see them here!</p>
            ) : (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-gray-200 rounded-md overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        <LazyImage
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          loading="lazy"
                          className="object-cover"
                          fallbackText={product.name}
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{product.name}</span>
                      <span className="text-sm text-gray-500">₹{product.price} · {product.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
