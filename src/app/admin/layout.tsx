import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-2xl font-bold text-primary flex items-center gap-2">
            BabyBloom
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
