"use client";

import { X, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
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
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 bg-secondary text-white p-3 md:px-6 md:py-3 rounded-full font-bold shadow-2xl transition-all duration-300 hover:bg-secondary/90 hover:scale-105 active:scale-95 flex items-center gap-2 md:gap-3 animate-bounce shadow-secondary/30"
        >
          <ShoppingBag size={24} className="md:w-5 md:h-5" />
          <span className="hidden md:inline">Go to Cart</span>
          <span className="absolute -top-1 -right-1 md:relative md:top-auto md:right-auto bg-white text-secondary px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{totalItems}</span>
        </button>
      );
    }
    return null;
  }

  const handleCheckout = () => {
    const url = getWhatsAppCheckoutUrl(cart);
    window.open(url, '_blank');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-secondary/20 flex justify-between items-center bg-background">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <ShoppingBag />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-text/60 hover:text-primary transition-colors hover:bg-secondary/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text/50 space-y-4">
              <ShoppingBag size={48} className="text-secondary/50" />
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-primary font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-background/50 rounded-2xl border border-secondary/10">
                <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-text line-clamp-1">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-text/40 hover:text-primary">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-text/60 mt-1">Age: {item.ageGroup}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold text-primary">₹{item.price}</p>
                    <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm border border-secondary/20">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-text hover:text-primary"><Minus size={14} /></button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-text hover:text-primary"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 pb-8 md:p-6 bg-background border-t border-secondary/20 space-y-3 md:space-y-4">
            <div className="flex justify-between text-base md:text-lg font-bold text-text">
              <span>Total</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle size={24} />
              Checkout via WhatsApp
            </button>
            <p className="text-xs text-center text-text/60">
              You will be redirected to WhatsApp to confirm your order.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
