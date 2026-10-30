"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Clock, MessageSquare, AlertCircle, FileText } from "lucide-react";
import { ADMIN_BASE_PATH } from "@/lib/admin";
import { formatInvoiceNumber } from "@/lib/invoices";

function ApproveOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!orderId) {
      setErrorMessage("No Order ID provided in the link.");
      setLoading(false);
      return;
    }

    const approveOrder = async () => {
      try {
        // 1. Fetch current order
        const getRes = await fetch(`/api/orders/${orderId}`);
        const orderData = await getRes.json();

        if (!getRes.ok) {
          throw new Error(orderData.error || "Order not found");
        }

        // 2. Approve order if not already approved
        if (orderData.status !== "approved") {
          const patchRes = await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
          });

          if (!patchRes.ok) {
            throw new Error("Could not update order status");
          }
        }

        let parsedCustomer = {
          name: orderData.customerName,
          email: "",
          phone: "",
        };

        try {
          if (orderData.customerName && orderData.customerName.startsWith("{")) {
            parsedCustomer = JSON.parse(orderData.customerName);
          }
        } catch {}

        setOrderDetails({
          ...orderData,
          customerName: parsedCustomer.name || "Customer",
          customerEmail: parsedCustomer.email || "",
          phone: parsedCustomer.phone || "",
        });
        setSuccess(true);
      } catch (err: any) {
        console.error("Approval error:", err);
        setErrorMessage(err.message || "Failed to approve order");
      } finally {
        setLoading(false);
      }
    };

    approveOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
        
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-[#ff2b75] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-base font-bold text-gray-700">Approving Order #{orderId}...</h2>
          </div>
        ) : errorMessage ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Could not approve order</h2>
            <p className="text-xs text-gray-500">{errorMessage}</p>
            <div className="pt-2">
              <Link
                href={`${ADMIN_BASE_PATH}/orders`}
                className="inline-block bg-[#ff2b75] hover:bg-[#e01d62] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                Go to Admin Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Green Success Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={38} />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Order Approved
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">
                Order #{orderId} Accepted!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                The order status is now updated to <strong>Approved</strong> in the Admin Panel.
                {orderDetails?.customerEmail
                  ? ` Confirmation email has been sent to ${orderDetails.customerEmail}.`
                  : ""}
              </p>
            </div>

            {/* Order Card Preview */}
            {orderDetails && (
              <div className="bg-pink-50/40 rounded-2xl p-4 text-left border border-pink-100 text-xs space-y-2">
                <div className="flex justify-between font-bold text-gray-800 pb-1 border-b border-pink-100">
                  <span>Total Amount:</span>
                  <span className="text-[#ff2b75] text-sm">₹{orderDetails.total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Customer:</span>
                  <span className="font-semibold text-gray-900">{orderDetails.customerName}</span>
                </div>
                {orderDetails.customerEmail && (
                  <div className="flex justify-between text-gray-600">
                    <span>Email:</span>
                    <span className="font-semibold text-gray-900">{orderDetails.customerEmail}</span>
                  </div>
                )}
                {orderDetails.phone && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phone:</span>
                    <span className="font-semibold text-gray-900">{orderDetails.phone}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Invoice No:</span>
                  <span className="font-mono font-bold text-[#ff2b75]">
                    {formatInvoiceNumber(orderDetails.id, orderDetails.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600 uppercase">Approved</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href={`${ADMIN_BASE_PATH}/invoices?orderId=${orderId}`}
                className="w-full bg-pink-50 hover:bg-pink-100 text-[#ff2b75] border border-pink-200 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileText size={16} />
                <span>View / Print GST Invoice</span>
              </Link>

              <Link
                href={`${ADMIN_BASE_PATH}/orders`}
                className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={17} />
                <span>Open Admin Orders Panel</span>
                <ArrowRight size={15} />
              </Link>

              {orderDetails?.phone && (
                <Link
                  href={`https://wa.me/${orderDetails.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi ${orderDetails.customerName}, your Babybloom Order #${orderId} for ₹${orderDetails.total} has been confirmed and approved! We are preparing it for delivery.`
                  )}`}
                  target="_blank"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageSquare size={15} />
                  <span>Notify Customer on WhatsApp</span>
                </Link>
              )}

              <Link
                href={ADMIN_BASE_PATH}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-bold text-xs text-center transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ApproveOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-[#ff2b75] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ApproveOrderContent />
    </Suspense>
  );
}
