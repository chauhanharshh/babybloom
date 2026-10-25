"use client";

import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isCartOpen) {
    if (totalItems > 0) {
      return (
        <Link
          href="/cart"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 bg-[#ff2b75] hover:bg-[#e01d62] text-white px-4 py-3 md:px-5 md:py-3.5 rounded-full font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 shadow-pink-500/30"
          aria-label="View Cart"
        >
          <ShoppingBag size={20} className="shrink-0" />
          <span className="text-xs sm:text-sm font-bold">View Cart</span>
          <span className="bg-white text-[#ff2b75] px-2 py-0.5 rounded-full text-xs font-black shadow-xs">
            {totalItems}
          </span>
        </Link>
      );
    }
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 flex justify-between items-center bg-pink-50/50">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-[#ff2b75]" size={20} />
            <span>My Cart</span>
            <span className="bg-[#ff2b75] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Alert */}
        <div className="bg-[#fff0f5] px-5 py-2.5 border-b border-pink-100 text-xs font-semibold text-gray-700 flex items-center justify-between">
          <span className="text-emerald-600 font-bold">Free Shipping on all orders!</span>
          <Link
            href="/cart"
            onClick={() => setIsCartOpen(false)}
            className="text-[11px] font-bold text-[#ff2b75] hover:underline"
          >
            View Full Cart &rarr;
          </Link>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-[#ff2b75]">
                <ShoppingBag size={32} />
              </div>
              <p className="text-base font-bold text-gray-800">Your cart is empty</p>
              <p className="text-xs text-gray-500">Explore our cute collections for your little ones!</p>
              <Link
                href="/categories"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-[#ff2b75] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#e01d62] transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-pink-50/40 rounded-2xl border border-pink-100/80">
                {/* Item Image */}
                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-pink-50/20 border border-pink-100 flex items-center justify-center">
                  <LazyImage
                    src={item.imageUrl || "/images/products/party-frock.jpg"}
                    alt={item.name}
                    fill
                    loading="lazy"
                    className="object-cover"
                    fallbackText={item.name}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Remove"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    {item.size && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.size}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-extrabold text-[#ff2b75] text-sm">₹{item.price * item.quantity}</p>
                    <div className="flex items-center gap-2 bg-white rounded-full px-2 py-0.5 shadow-xs border border-pink-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-600 hover:text-[#ff2b75]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-600 hover:text-[#ff2b75]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-sm font-extrabold text-gray-900">
              <span>Total Amount</span>
              <span className="text-xl text-[#ff2b75]">₹{totalPrice}</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-pink-50 hover:bg-pink-100 text-[#ff2b75] py-2.5 rounded-xl font-bold text-xs active:scale-98 transition-all text-center"
              >
                View Full Cart (Apply Coupon & Details)
              </Link>
            </div>

            <p className="text-[11px] text-center text-gray-400">
              Free Shipping & 7-Day Easy Returns on all orders
            </p>
          </div>
        )}
      </div>
    </>
  );
}
