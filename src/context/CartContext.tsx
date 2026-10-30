"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  ageGroup: string;
  ageGroups?: string[];
  category?: string;
  categories?: string[];
  description?: string | null;
  mrp?: number;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, size?: string, addQty?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: { code: string; percent: number } | null;
  setAppliedCoupon: (coupon: { code: string; percent: number } | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);

  // Sync with localStorage on client & refresh live stock limits from DB
  useEffect(() => {
    let initialCart: CartItem[] = [];
    try {
      const savedCart = localStorage.getItem("bb_cart");
      if (savedCart) {
        initialCart = JSON.parse(savedCart);
        setCart(initialCart);
      }
      const savedWishlist = localStorage.getItem("bb_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // Fallback
    }

    // Sync latest stock limits from /api/products so saved cart items respect current stock
    if (initialCart.length > 0) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((products) => {
          if (!Array.isArray(products)) return;
          const stockMap = new Map<string, number>();
          for (const p of products) {
            if (p && p.id !== undefined && typeof p.stock === "number") {
              stockMap.set(String(p.id), p.stock);
            }
          }
          setCart((prevCart) => {
            const synced = prevCart
              .map((item) => {
                const liveStock = stockMap.get(String(item.id));
                if (typeof liveStock === "number") {
                  if (liveStock <= 0) return null;
                  return {
                    ...item,
                    stock: liveStock,
                    quantity: Math.min(item.quantity, liveStock),
                  };
                }
                return item;
              })
              .filter(Boolean) as CartItem[];
            try {
              localStorage.setItem("bb_cart", JSON.stringify(synced));
            } catch {}
            return synced;
          });
        })
        .catch(() => {});
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("bb_cart", JSON.stringify(newCart));
    } catch {}
  };

  const saveWishlist = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    try {
      localStorage.setItem("bb_wishlist", JSON.stringify(newWishlist));
    } catch {}
  };

  const addToCart = (product: Product, size?: string, addQty = 1): boolean => {
    const requestedQty = Math.max(1, addQty);
    const existing = cart.find((item) => item.id === product.id);
    const maxStock =
      typeof product.stock === "number"
        ? product.stock
        : typeof existing?.stock === "number"
        ? existing.stock
        : undefined;

    // Cannot add if out of stock
    if (typeof maxStock === "number" && maxStock <= 0) {
      return false;
    }

    if (existing) {
      if (typeof maxStock === "number" && existing.quantity >= maxStock) {
        return false;
      }
      const nextQty =
        typeof maxStock === "number"
          ? Math.min(existing.quantity + requestedQty, maxStock)
          : existing.quantity + requestedQty;

      saveCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock: maxStock ?? item.stock,
                quantity: nextQty,
                ...(size ? { size } : {}),
              }
            : item
        )
      );
      return true;
    } else {
      const initialQty =
        typeof maxStock === "number" ? Math.min(requestedQty, maxStock) : requestedQty;
      saveCart([
        ...cart,
        {
          ...product,
          stock: maxStock,
          quantity: initialQty,
          size: size || `${product.ageGroup || "1-2Y"} / Standard`,
        },
      ]);
      return true;
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    saveCart(
      cart.map((item) => {
        if (item.id !== productId) return item;
        const clampedQty =
          typeof item.stock === "number" ? Math.min(quantity, item.stock) : quantity;
        return { ...item, quantity: clampedQty };
      })
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      saveWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      saveWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalPrice,
        appliedCoupon,
        setAppliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
