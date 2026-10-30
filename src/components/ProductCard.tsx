"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, Heart, ShoppingCart } from "lucide-react";
import { useCart, Product } from "@/context/CartContext";
import LazyImage from "@/components/LazyImage";

interface ProductCardProps {
  product: Product & { mrp?: number; discountPercent?: number; offerTitle?: string };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity, toggleWishlist, isInWishlist } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const isLiked = isInWishlist(product.id);

  // If MRP not provided, generate a sensible strikethrough price (+40-50%)
  const mrp = product.mrp || Math.round(product.price * 1.5);

  return (
    <div className="group relative bg-white rounded-2xl p-2.5 sm:p-3 transition-all duration-300 hover:shadow-md border border-gray-100 shadow-xs flex flex-col justify-between">
      {/* Product Image Area / Placeholder (Links to Product Details Page) */}
      <div className="relative aspect-square mb-2 sm:mb-2.5 rounded-xl overflow-hidden bg-pink-50/20 flex items-center justify-center">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-0">
          <LazyImage
            src={product.imageUrl || ""}
            alt={product.name}
            fill
            loading="lazy"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            fallbackText={product.name}
          />
        </Link>

        {/* Dynamic Offer Badge */}
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#ff2b75] to-pink-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-0.5">
            <span>{product.discountPercent}% OFF</span>
          </div>
        ) : null}

        {/* Wishlist Heart Button (Clean circular white button matching mockup) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs border border-gray-100/80 transition-transform active:scale-90 ${
            isLiked ? "text-[#ff2b75]" : "text-gray-700 hover:text-[#ff2b75]"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart size={14} fill={isLiked ? "#ff2b75" : "none"} strokeWidth={2} />
        </button>

        {/* Age tag if available */}
        {(() => {
          const displayAge = product.ageGroups && product.ageGroups.length > 0
            ? (product.ageGroups.length > 2
                ? `${product.ageGroups[0]} +${product.ageGroups.length - 1} sizes`
                : product.ageGroups.join(", "))
            : product.ageGroup;
          if (!displayAge) return null;
          return (
            <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-[#ff2b75] shadow-xs pointer-events-none max-w-[80%] truncate">
              {displayAge}
            </div>
          );
        })()}
      </div>

      {/* Product Info (Links to Details) */}
      <Link href={`/product/${product.id}`} className="block space-y-0.5 mb-2 px-0.5">
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-1 group-hover:text-[#ff2b75] transition-colors">
          {product.name}
        </h3>

        {/* Price & Strikethrough MRP */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-gray-900 font-extrabold text-sm sm:text-base">
            ₹{product.price}
          </span>
          <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
            ₹{mrp}
          </span>
        </div>
      </Link>

      {/* Cart Action Button / Quantity Controls */}
      {cartItem ? (
        <div className="w-full flex items-center justify-between bg-pink-50 border border-[#ff2b75]/30 rounded-xl p-1 transition-all">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateQuantity(product.id, cartItem.quantity - 1);
            }}
            className="w-7 h-7 flex items-center justify-center bg-white text-[#ff2b75] rounded-lg shadow-xs hover:bg-[#ff2b75] hover:text-white transition-colors"
          >
            <Minus size={13} />
          </button>

          <span className="font-extrabold text-xs text-[#ff2b75] px-2">
            {cartItem.quantity}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateQuantity(product.id, cartItem.quantity + 1);
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#ff2b75] text-white rounded-lg shadow-xs hover:bg-[#e01d62] transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <ShoppingCart size={13} className="shrink-0" />
          <span>Add to Cart</span>
        </button>
      )}
    </div>
  );
}
