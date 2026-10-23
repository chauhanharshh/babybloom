"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  ageGroup: string;
  category?: string;
  description?: string | null;
  mrp?: number;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Sample default items for initial demo
const DEFAULT_INITIAL_CART: CartItem[] = [
  {
    id: "1",
    name: "Pink Party Frock",
    price: 999,
    mrp: 1499,
    quantity: 1,
    size: "1-2Y / Pink",
    imageUrl: "/images/products/party-frock.jpg",
    ageGroup: "1-6 Yrs",
  },
  {
    id: "2",
    name: "Stylish Boy Set",
    price: 799,
    mrp: 1199,
    quantity: 1,
    size: "2-3Y / White-Blue",
    imageUrl: "/images/products/boy-set.jpg",
    ageGroup: "1-6 Yrs",
  },
  {
    id: "3",
    name: "Yellow Summer Dress",
    price: 749,
    mrp: 1199,
    quantity: 1,
    size: "3-4Y / Yellow",
    imageUrl: "/images/products/floral-dress.jpg",
    ageGroup: "1-5 Yrs",
  },
];

const DEFAULT_INITIAL_WISHLIST: Product[] = [
  {
    id: "1",
    name: "Beautiful Party Frock",
    price: 999,
    mrp: 1499,
    imageUrl: "/images/products/party-frock.jpg",
    ageGroup: "1-6 Yrs",
  },
  {
    id: "2",
    name: "Stylish Boy Set",
    price: 799,
    mrp: 1199,
    imageUrl: "/images/products/boy-set.jpg",
    ageGroup: "1-6 Yrs",
  },
  {
    id: "4",
    name: "Cute Hoodie Set",
    price: 899,
    mrp: 1399,
    imageUrl: "/images/products/hoodie-set.jpg",
    ageGroup: "2-6 Yrs",
  },
  {
    id: "3",
    name: "Floral Summer Dress",
    price: 669,
    mrp: 1299,
    imageUrl: "/images/products/floral-dress.jpg",
    ageGroup: "1-5 Yrs",
  },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(DEFAULT_INITIAL_CART);
  const [wishlist, setWishlist] = useState<Product[]>(DEFAULT_INITIAL_WISHLIST);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with localStorage on client
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("bb_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWishlist = localStorage.getItem("bb_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // Fallback
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

  const addToCart = (product: Product, size?: string) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      saveCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      saveCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          size: size || `${product.ageGroup || "1-2Y"} / Standard`,
        },
      ]);
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
      cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
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
