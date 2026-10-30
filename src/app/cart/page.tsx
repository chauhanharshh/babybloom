"use client";

import { useState } from "react";
import LazyImage from "@/components/LazyImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  Percent,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems, appliedCoupon, setAppliedCoupon } = useCart();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Toggle item selection
  const isSelected = (id: string) => selectedItems[id] !== false; // default true
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !isSelected(id) }));
  };

  const discount = appliedCoupon ? Math.round(totalPrice * (appliedCoupon.percent / 100)) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  const handleApplyCoupon = async () => {
    setCouponError("");
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/offers?active=true");
      const offers = await res.json();
      const match = offers.find(
        (o: { couponCode?: string; discountPercent: number }) =>
          o.couponCode && o.couponCode.toUpperCase() === trimmed
      );
      if (match) {
        setAppliedCoupon({ code: match.couponCode, percent: match.discountPercent });
        setIsCouponModalOpen(false);
      } else if (trimmed === "BABYBLOOM10") {
        setAppliedCoupon({ code: "BABYBLOOM10", percent: 10 });
        setIsCouponModalOpen(false);
      } else {
        setCouponError("Invalid or expired coupon code");
      }
    } catch {
      if (trimmed === "BABYBLOOM10") {
        setAppliedCoupon({ code: "BABYBLOOM10", percent: 10 });
        setIsCouponModalOpen(false);
      } else {
        setCouponError("Invalid coupon code");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/60 flex flex-col pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-8 flex-1">
        {/* Desktop Header (Single H1 in DOM across mobile & desktop) */}
        <div className="sr-only md:not-sr-only md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              My Cart <span className="text-gray-500 font-semibold text-xl">({totalItems} Items)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Review items in your cart and proceed to checkout</p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-bold text-[#ff2b75] hover:underline transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs space-y-3 my-12">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto">
              <ShoppingBag size={30} />
            </div>
            <p className="font-bold text-gray-800 text-base">Your shopping cart is empty</p>
            <p className="text-xs text-gray-500">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/categories"
              className="inline-block mt-2 bg-[#ff2b75] hover:bg-[#e01d62] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Items List & Coupon) */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Mobile Title Row: "My Cart (X Items)" & "Clear Cart" - Matches Mockup Exactly */}
              <div className="flex md:hidden justify-between items-center pt-2 pb-1">
                <p className="text-base font-extrabold text-gray-900 tracking-tight">
                  My Cart <span className="font-semibold text-gray-500">({totalItems} Items)</span>
                </p>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs font-bold text-[#ff2b75] hover:underline transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5">
                {cart.map((item) => {
                  const checked = isSelected(item.id);
                  const mrp = item.mrp || Math.round(item.price * 1.5);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs flex items-center gap-3 relative transition-all"
                    >
                      {/* Pink Custom Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          checked ? "bg-[#ff2b75] text-white" : "border border-gray-300 bg-white"
                        }`}
                      >
                        {checked && <Check size={13} strokeWidth={3} />}
                      </button>

                      {/* Item Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-pink-50/20 shrink-0 border border-gray-100">
                        <LazyImage
                          src={item.imageUrl || ""}
                          alt={item.name}
                          fill
                          loading="lazy"
                          className="object-cover"
                          fallbackText={item.name}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {item.size || "0-12 Months / Standard"}
                        </p>

                        {/* Price & Stepper Row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                              ₹{item.price}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{mrp}
                            </span>
                          </div>

                          {/* Stepper */}
                          {(() => {
                            const isAtMax =
                              typeof item.stock === "number" && item.quantity >= item.stock;
                            return (
                              <div className="flex flex-col items-end gap-0.5">
                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-2xs cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={11} />
                                  </button>
                                  <span className="w-6 text-center text-xs font-bold text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isAtMax}
                                    onClick={() => {
                                      if (!isAtMax) {
                                        updateQuantity(item.id, item.quantity + 1);
                                      }
                                    }}
                                    title={isAtMax ? `Max available stock (${item.stock})` : "Increase quantity"}
                                    className={`w-6 h-6 rounded bg-white flex items-center justify-center shadow-2xs ${
                                      isAtMax
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-700 hover:text-[#ff2b75] cursor-pointer"
                                    }`}
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>
                                {isAtMax && (
                                  <span className="text-[10px] font-bold text-amber-600">
                                    Max {item.stock} available
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Trash / Remove Button (Pink on top-right matching mockup) */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-3 right-3 text-[#ff2b75] hover:text-[#e01d62] p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Apply Coupon Card */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(!isCouponModalOpen)}
                  className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center">
                      <Percent size={13} strokeWidth={2.5} />
                    </div>
                    <span>
                      {appliedCoupon
                        ? `Coupon '${appliedCoupon.code}' Applied (${appliedCoupon.percent}% OFF)!`
                        : "Apply Coupon"}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                {/* Expandable Coupon Input */}
                {isCouponModalOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code (e.g. BABYBLOOM10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-[#ff2b75]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-[#ff2b75] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e01d62]"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-1.5 text-xs text-red-500 font-semibold">{couponError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Price Details & Proceed to Checkout) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {/* Price Details Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
                <h2 className="text-xs sm:text-sm font-extrabold text-gray-900">Price Details</h2>

                <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900 font-bold">₹{totalPrice}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code} - {appliedCoupon.percent}%)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase">FREE</span>
                </div>

                <hr className="border-gray-100 my-1" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900">Total Amount</span>
                  <span className="text-base sm:text-lg font-black text-gray-900">₹{finalTotal}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="pt-1 pb-6 lg:pb-0">
                <Link
                  href="/checkout"
                  className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 active:scale-98 transition-all block text-center"
                >
                  Proceed to Checkout
                </Link>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  Free Shipping & 7-Day Easy Returns on all orders
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </main>
  );
}
