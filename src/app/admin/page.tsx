import { IndianRupee, ShoppingBag, Package, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboard() {
  // Real data from DB
  const [orders, recentProducts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 5,
    }),
    prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

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
      value: (await prisma.product.count()).toString(),
      icon: Package,
      sub: "In your catalog",
      color: "text-blue-600",
    },
    {
      name: "Pending Orders",
      value: pendingCount.toString(),
      icon: Clock,
      sub: "Awaiting approval",
      color: "text-orange-600",
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Real Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet. They will appear when customers checkout via WhatsApp.</p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">Order #{order.id}</span>
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
              ))
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
                    <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      )}
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
