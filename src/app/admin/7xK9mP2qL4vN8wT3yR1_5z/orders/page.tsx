"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, Clock, ChevronDown, ChevronUp, RefreshCw, Trash2, FileText } from "lucide-react";
import { ADMIN_BASE_PATH } from "@/lib/admin";
import { formatInvoiceNumber } from "@/lib/invoices";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  ageGroup: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentMethod?: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      if (status === "approved") {
        const targetOrder = orders.find((o) => o.id === id);
        const invText = data?.invoiceNumber ? ` (Invoice: ${data.invoiceNumber})` : "";
        if (data?.customerEmailSent && targetOrder?.customerEmail) {
          setToastMessage(`Order #${id} approved${invText}! GST Invoice emailed to ${targetOrder.customerEmail}.`);
        } else {
          setToastMessage(`Order #${id} approved${invText}!`);
        }
        setTimeout(() => setToastMessage(null), 5000);
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm(`Are you sure you want to delete Order #${id}?`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete order:", e);
    } finally {
      setUpdating(null);
    }
  };

  const clearAllOrders = async () => {
    if (!confirm("Are you sure you want to permanently delete ALL orders from the database? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { method: "DELETE" });
      if (res.ok) {
        setOrders([]);
      }
    } catch (e) {
      console.error("Failed to clear orders:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage customer orders, view delivery details, and update statuses.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {orders.length > 0 && (
            <button
              onClick={clearAllOrders}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              title="Delete all orders"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Orders
            </button>
          )}
          <button
            onClick={fetchOrders}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">No orders yet.</p>
          <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers checkout via WhatsApp.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors gap-4"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    {order.status === "approved" && (
                      <p className="text-[11px] font-mono font-bold text-[#ff2b75] mt-0.5">
                        {formatInvoiceNumber(order.id, order.createdAt)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                    {order.customerEmail && (
                      <p className="text-xs text-[#ff2b75] font-medium">{order.customerEmail}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.phone && ` · ${order.phone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-gray-900">₹{order.total.toFixed(0)}</p>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* View GST Invoice button for Approved Orders */}
                  {order.status === "approved" && (
                    <Link
                      href={`${ADMIN_BASE_PATH}/invoices?orderId=${order.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#ff2b75] rounded-lg text-xs font-bold transition-colors border border-pink-100"
                      title="View GST Tax Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">GST Invoice</span>
                    </Link>
                  )}

                  {/* Approve / Reject */}
                  {order.status === "pending" && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={updating === order.id}
                        onClick={() => updateStatus(order.id, "approved")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        disabled={updating === order.id}
                        onClick={() => updateStatus(order.id, "rejected")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  )}

                  <button
                    disabled={updating === order.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOrder(order.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {expandedId === order.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded: Order Items */}
              {expandedId === order.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Age: {item.ageGroup} · Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                          <p className="text-xs text-gray-400">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="text-xs text-gray-500">
                      {order.address && (
                        <p><strong className="text-gray-700">Delivery Address:</strong> {order.address}</p>
                      )}
                      {order.paymentMethod && (
                        <p><strong className="text-gray-700">Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      Total: ₹{order.total.toFixed(0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
