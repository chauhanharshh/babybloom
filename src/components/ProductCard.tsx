"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCart, Product } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const cartItem = cart.find(item => item.id === product.id);

  return (
    <div 
      className="group relative bg-white rounded-3xl p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:hover:-translate-y-1 overflow-hidden border border-secondary/10"
    >
      <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-background">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 md:group-hover:scale-105 scale-100"
        />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-primary">
          {product.ageGroup}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-text text-lg leading-tight line-clamp-1">{product.name}</h3>
        <p className="text-primary font-bold text-xl">₹{product.price}</p>
      </div>

      {cartItem ? (
        <div className="absolute bottom-4 right-4 z-10 flex items-center bg-white border-2 border-primary rounded-full shadow-md transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(product.id, cartItem.quantity - 1); }}
            className="p-2 text-primary hover:bg-primary/10 rounded-l-full transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="px-2 font-bold text-primary min-w-[1.5rem] text-center">
            {cartItem.quantity}
          </span>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(product.id, cartItem.quantity + 1); }}
            className="p-2 text-primary hover:bg-primary/10 rounded-r-full transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-md transition-all duration-300 hover:bg-primary/90 hover:scale-110 active:scale-95 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0"
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}
