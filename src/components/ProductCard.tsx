"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ImageOff } from "lucide-react";
import { useCart, Product } from "@/context/CartContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartItem = cart.find(item => item.id === product.id);

  // blob: URLs are temporary and break on reload — treat as no image
  const isBlobUrl = product.imageUrl?.startsWith("blob:");
  const showFallback = imgError || isBlobUrl || !product.imageUrl;
  const imageSrc = showFallback ? FALLBACK_IMAGE : product.imageUrl;

  return (
    <div 
      className="group relative bg-white rounded-3xl p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:hover:-translate-y-1 overflow-hidden border border-secondary/10"
    >
      <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-background">
        <Image
          src={imageSrc!}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 md:group-hover:scale-105 scale-100"
          onError={() => setImgError(true)}
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
        <div className="absolute bottom-4 right-4 z-10 flex items-center bg-white border-2 border-primary rounded-full shadow-md transition-all duration-300">
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
          className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-md transition-all duration-300 hover:bg-primary/90 hover:scale-110 active:scale-95"
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}

