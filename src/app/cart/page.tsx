"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Trash2, 
  Tag, 
  ChevronRight,
  Check,
  Percent
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Toggle item selection
  const isSelected = (id: string) => selectedItems[id] !== false; // default true
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !isSelected(id) }));
  };

  const discount = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  return (
    <main className="min-h-screen bg-gray-50/60 flex flex-col pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Screen 5 Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 -ml-1 text-gray-700 hover:text-[#ff2b75]"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Babybloom Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="22" r="18" fill="#ff4d88" />
              <circle cx="76" cy="40" r="18" fill="#ff4d88" />
              <circle cx="66" cy="74" r="18" fill="#ff4d88" />
              <circle cx="34" cy="74" r="18" fill="#ff4d88" />
              <circle cx="24" cy="40" r="18" fill="#ff4d88" />
              <circle cx="50" cy="50" r="14" fill="#fcd34d" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#ff2b75] tracking-tight">Babybloom</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-1 text-gray-700 hover:text-[#ff2b75]">
            <Search size={20} />
          </Link>
          <Link href="/cart" className="p-1 text-[#ff2b75] relative">
            <ShoppingBag size={21} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff2b75] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-8 flex-1">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-gray-500 mt-1">Review items in your cart and proceed to checkout</p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-bold text-[#ff2b75] hover:underline transition-colors"
            >
              Clear Entire Cart
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
              {/* Mobile Title Row: "My Cart (3 Items)" & "Clear Cart" */}
              <div className="flex md:hidden justify-between items-center pt-1">
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                  My Cart <span className="font-semibold text-gray-500">({totalItems} Items)</span>
                </h1>
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
                        <Image
                          src={item.imageUrl || "/images/products/party-frock.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {item.size || "1-2Y / Pink"}
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
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-2xs"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-2xs"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
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
                    <span>{couponApplied ? "Coupon BABYBLOOM10 Applied!" : "Apply Coupon"}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                {/* Expandable Coupon Input */}
                {isCouponModalOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code (e.g. BABYBLOOM10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-[#ff2b75]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (couponCode.trim()) {
                          setCouponApplied(true);
                          setIsCouponModalOpen(false);
                        }
                      }}
                      className="bg-[#ff2b75] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e01d62]"
                    >
                      Apply
                    </button>
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

                {couponApplied && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600 font-semibold">
                    <span>Coupon Discount (10%)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase">FREE</span>
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
