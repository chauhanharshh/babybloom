"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight,
  Lock, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  CheckCircle2,
  MapPin,
  X,
  Phone,
  User,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  // Address state
  const [address, setAddress] = useState({
    name: "Harsh Chauhan",
    phone: "+91 8941000584",
    line1: "Khanna Nagar, House no. 41,",
    line2: "Opposite Kaushik Academy,",
    cityStateZip: "Haridwar - 249401, Uttarakhand",
  });

  // Modal for changing address
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  // Selected payment method
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card" | "netbanking">("cod");

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; total: number } | null>(null);

  const displayTotal = totalPrice > 0 ? totalPrice : 2547;
  const displayItemsCount = totalItems > 0 ? totalItems : 3;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddress(tempAddress);
    setIsAddressModalOpen(false);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Items to send
      const orderItems = cart.length > 0 
        ? cart 
        : [
            { id: "1", name: "Pink Party Frock", price: 999, quantity: 1, ageGroup: "1-2 Yrs" },
            { id: "2", name: "Stylish Boy Set", price: 799, quantity: 1, ageGroup: "2-3 Yrs" },
            { id: "3", name: "Yellow Summer Dress", price: 749, quantity: 1, ageGroup: "3-4 Yrs" },
          ];

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: orderItems,
          customerName: address.name,
          address: `${address.line1} ${address.line2} ${address.cityStateZip}`,
          phone: address.phone,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess({ id: data.orderId || Math.floor(100000 + Math.random() * 900000), total: displayTotal });
        clearCart();
      } else {
        // Fallback demo order id
        setOrderSuccess({ id: Math.floor(100000 + Math.random() * 900000), total: displayTotal });
        clearCart();
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      setOrderSuccess({ id: Math.floor(100000 + Math.random() * 900000), total: displayTotal });
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/70 flex flex-col pb-12">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Screen 8 Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-800 hover:text-[#ff2b75] transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Checkout</h1>
        </div>

        {/* Small Babybloom branding on right */}
        <Link href="/" className="flex items-center gap-1">
          <div className="w-5 h-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="22" r="18" fill="#ff4d88" />
              <circle cx="76" cy="40" r="18" fill="#ff4d88" />
              <circle cx="66" cy="74" r="18" fill="#ff4d88" />
              <circle cx="34" cy="74" r="18" fill="#ff4d88" />
              <circle cx="24" cy="40" r="18" fill="#ff4d88" />
              <circle cx="50" cy="50" r="14" fill="#fcd34d" />
            </svg>
          </div>
          <span className="text-sm font-extrabold text-[#ff2b75]">Babybloom</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1">
        {/* Desktop Page Title */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Review your delivery address, select a payment method and place your order</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="text-[#ff2b75]">1. Address</span>
            <span>&rarr;</span>
            <span className="text-[#ff2b75]">2. Payment</span>
            <span>&rarr;</span>
            <span className="text-gray-400">3. Confirmation</span>
          </div>
        </div>

        {/* Success Modal / Banner if order placed */}
        {orderSuccess ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg text-center space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
              <p className="text-xs text-gray-500 mt-1">
                Order ID: <span className="font-bold text-gray-800">#{orderSuccess.id}</span>
              </p>
            </div>
            <div className="bg-pink-50/50 rounded-2xl p-4 text-left text-xs space-y-1.5 border border-pink-100/60">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total Amount:</span>
                <span className="text-[#ff2b75]">₹{orderSuccess.total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment:</span>
                <span className="font-semibold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Deliver to:</span>
                <span className="font-semibold">{address.name}</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`https://wa.me/918941000584?text=${encodeURIComponent(`Hi Babybloom, I have placed order #${orderSuccess.id} for ₹${orderSuccess.total}. Please confirm!`)}`}
                target="_blank"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                Confirm on WhatsApp
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold text-xs text-center transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Address & Payment Method) */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Delivery Address */}
              <section className="space-y-2">
                <div className="flex justify-between items-center px-0.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                    1. Delivery Address
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setTempAddress(address);
                      setIsAddressModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#ff2b75] hover:text-[#e01d62] flex items-center gap-0.5 transition-colors"
                  >
                    <span>Change</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Delivery Address Card (Exact Mockup Match) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-start gap-3.5">
                  {/* Active Pink Radio Button */}
                  <div className="mt-1 w-4 h-4 rounded-full border-2 border-[#ff2b75] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />
                  </div>

                  {/* Address Text */}
                  <div className="text-xs space-y-1 text-gray-600">
                    <p className="font-bold text-gray-900 text-[13px] sm:text-sm">{address.name}</p>
                    <p className="font-medium text-gray-700">{address.phone}</p>
                    <div className="leading-relaxed text-gray-500 pt-0.5">
                      <p>{address.line1}</p>
                      <p>{address.line2}</p>
                      <p>{address.cityStateZip}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Payment Method */}
              <section className="space-y-2">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight px-0.5">
                  2. Payment Method
                </h2>

                {/* Payment Methods Card (Exact Mockup Match) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-50 overflow-hidden">
                  {/* Option 1: Cash on Delivery (COD) */}
                  <label 
                    onClick={() => setPaymentMethod("cod")}
                    className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "cod" ? "border-[#ff2b75]" : "border-gray-300"
                    }`}>
                      {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Banknote size={16} />
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-gray-800 flex-1">
                      Cash on Delivery (COD)
                    </span>
                  </label>

                  {/* Option 2: UPI (GPay, PhonePe, Paytm) */}
                  <label 
                    onClick={() => setPaymentMethod("upi")}
                    className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "upi" ? "border-[#ff2b75]" : "border-gray-300"
                    }`}>
                      {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ff2b75] flex items-center justify-center shrink-0">
                      <Smartphone size={16} />
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-gray-800 flex-1">
                      UPI (GPay, PhonePe, Paytm)
                    </span>
                  </label>

                  {/* Option 3: Credit/Debit Card */}
                  <label 
                    onClick={() => setPaymentMethod("card")}
                    className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "card" ? "border-[#ff2b75]" : "border-gray-300"
                    }`}>
                      {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard size={16} />
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-gray-800 flex-1">
                      Credit/Debit Card
                    </span>
                  </label>

                  {/* Option 4: Net Banking */}
                  <label 
                    onClick={() => setPaymentMethod("netbanking")}
                    className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "netbanking" ? "border-[#ff2b75]" : "border-gray-300"
                    }`}>
                      {paymentMethod === "netbanking" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Landmark size={16} />
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-gray-800 flex-1">
                      Net Banking
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column (Order Summary & Place Order Button) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {/* 3. Order Summary */}
              <section className="space-y-2">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight px-0.5">
                  3. Order Summary
                </h2>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                    <span>Subtotal ({displayItemsCount} items)</span>
                    <span className="text-gray-900 font-bold">₹{displayTotal}</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
                  </div>

                  <hr className="border-gray-100 my-1" />

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Total Amount</span>
                    <span className="text-base sm:text-lg font-black text-gray-900">₹{displayTotal}</span>
                  </div>
                </div>
              </section>

              {/* Place Order Button */}
              <div className="pt-1 pb-6 lg:pb-0">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                >
                  <Lock size={15} />
                  <span>{isSubmitting ? "Placing Order..." : "Place Order"}</span>
                </button>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  🔒 100% Safe & Secure Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900">Edit Delivery Address</h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={tempAddress.name}
                  onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={tempAddress.phone}
                  onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">House No. / Street</label>
                <input
                  type="text"
                  required
                  value={tempAddress.line1}
                  onChange={(e) => setTempAddress({ ...tempAddress, line1: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Landmark / Locality</label>
                <input
                  type="text"
                  value={tempAddress.line2}
                  onChange={(e) => setTempAddress({ ...tempAddress, line2: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">City, Pincode & State</label>
                <input
                  type="text"
                  required
                  value={tempAddress.cityStateZip}
                  onChange={(e) => setTempAddress({ ...tempAddress, cityStateZip: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#ff2b75] hover:bg-[#e01d62] text-white text-xs font-bold shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="hidden md:block">
        <Footer />
      </div>
    </main>
  );
}
