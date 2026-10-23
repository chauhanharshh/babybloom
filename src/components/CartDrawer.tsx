"use client";

import { X, Minus, Plus, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { getWhatsAppCheckoutUrl } from "@/utils/whatsapp";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isCartOpen) {
    if (totalItems > 0) {
      return (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-[#ff2b75] hover:bg-[#e01d62] text-white p-3.5 md:px-6 md:py-3.5 rounded-full font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 shadow-pink-500/30 animate-bounce"
          aria-label="View Cart"
        >
          <ShoppingBag size={22} className="shrink-0" />
          <span className="hidden md:inline text-sm">View Cart</span>
          <span className="bg-white text-[#ff2b75] px-2 py-0.5 rounded-full text-xs font-black shadow-xs">
            {totalItems}
          </span>
        </button>
      );
    }
    return null;
  }

  const handleCheckout = async () => {
    try {
      // Save order to DB
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id.startsWith("sample-") ? "1" : item.id, // fallback to id 1 for samples
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            ageGroup: item.ageGroup || "1-6 Yrs",
          })),
          customerName: "WhatsApp Customer",
        }),
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }

    // Open WhatsApp checkout URL
    const url = getWhatsAppCheckoutUrl(cart);
    window.open(url, "_blank");
  };

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
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-[#ff2b75]" size={20} />
            <span>Your Shopping Cart</span>
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

        {/* Free Shipping Progress Alert */}
        <div className="bg-[#fff0f5] px-5 py-2.5 border-b border-pink-100 text-xs font-semibold text-gray-700 flex items-center justify-between">
          {totalPrice >= 999 ? (
            <span className="text-green-600 font-bold">🎉 Congratulations! You have unlocked Free Shipping!</span>
          ) : (
            <span>Add <strong className="text-[#ff2b75]">₹{999 - totalPrice}</strong> more for Free Shipping</span>
          )}
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
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-[#ff2b75] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#e01d62] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-pink-50/40 rounded-2xl border border-pink-100/80">
                {/* Item Image or Placeholder */}
                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white border border-pink-100 flex items-center justify-center">
                  {item.imageUrl && !item.imageUrl.startsWith("blob:") ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-pink-50 flex items-center justify-center text-[#ff2b75]">
                      <Sparkles size={16} />
                    </div>
                  )}
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
                    {item.ageGroup && (
                      <p className="text-[11px] text-gray-500 mt-0.5">Size/Age: {item.ageGroup}</p>
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

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-pink-50/40 border-t border-pink-100 space-y-3">
            <div className="flex justify-between items-center text-base font-extrabold text-gray-900">
              <span>Total Amount</span>
              <span className="text-xl text-[#ff2b75]">₹{totalPrice}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              <span>Checkout via WhatsApp</span>
            </button>
            
            <p className="text-[10px] text-center text-gray-500">
              You will be redirected to WhatsApp to confirm your items & delivery address.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

