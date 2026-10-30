"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LazyImage from "@/components/LazyImage";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Ruler,
  Check,
  Tag
} from "lucide-react";
import { useCart, Product } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface ProductDetailsClientProps {
  product: Product & { mrp?: number; description?: string | null };
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { cart, addToCart, toggleWishlist, isInWishlist, totalItems } = useCart();
  const maxStock = typeof product.stock === "number" ? product.stock : undefined;
  const isOutOfStock = typeof maxStock === "number" && maxStock <= 0;
  const inCartQty = cart.find((i) => i.id === product.id)?.quantity || 0;
  const remainingStock =
    typeof maxStock === "number" ? Math.max(0, maxStock - inCartQty) : undefined;

  const availableAgeGroups = useMemo(() => {
    if (Array.isArray(product.ageGroups) && product.ageGroups.length > 0) {
      return product.ageGroups.filter(Boolean);
    }
    if (product.ageGroup) {
      return product.ageGroup.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return ["Standard"];
  }, [product.ageGroups, product.ageGroup]);

  const allCategories = useMemo(() => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.filter(Boolean);
    }
    if (product.category) {
      return [product.category.trim()];
    }
    return [];
  }, [product.categories, product.category]);

  const [selectedSize, setSelectedSize] = useState(
    () => availableAgeGroups[0] || "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && product?.name) {
      document.title = `Buy ${product.name} Online (${product.category}) | BabyBloom`;
    }
  }, [product?.name, product?.category]);

  const isLiked = isInWishlist(product.id);
  const mrp = product.mrp || Math.round(product.price * 1.5);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  // Gallery images (use database image)
  const images = product.imageUrl ? [product.imageUrl] : [""];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, selectedSize, quantity);
    if (added) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 4000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    router.push("/checkout");
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <CartDrawer />

      {/* Screen 4 Mobile Top Header */}
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
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs flex-shrink-0">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="Babybloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold text-[#ff2b75] tracking-tight">Babybloom</span>
        </Link>

        {/* Right Action Icons: Search + Cart */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="p-1 text-gray-700 hover:text-[#ff2b75]">
            <Search size={20} />
          </Link>
          <Link href="/cart" className="p-1 text-gray-700 hover:text-[#ff2b75] relative">
            <ShoppingBag size={21} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff2b75] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-0 md:px-6 lg:px-8 py-0 md:py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10 lg:gap-14 items-start">
          {/* Left Column: Image Gallery Box */}
          <div className="md:sticky md:top-24 space-y-3">
            <div className="relative w-full aspect-square bg-pink-50/20 overflow-hidden md:rounded-3xl border-b md:border border-gray-100 shadow-xs">
              <LazyImage
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
                fallbackText={product.name}
              />

              {/* Floating Top Buttons on Image (Left Back, Right Heart & Share) */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 md:hidden">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-800 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm transition-transform active:scale-90 ${
                      isLiked ? "text-[#ff2b75]" : "text-gray-700"
                    }`}
                  >
                    <Heart size={16} fill={isLiked ? "#ff2b75" : "none"} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href });
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 shadow-sm"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`transition-all rounded-full ${
                        idx === currentImageIndex
                          ? "w-5 h-1.5 bg-[#ff2b75]"
                          : "w-1.5 h-1.5 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? "border-[#ff2b75] shadow-xs" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <LazyImage
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details Body */}
          <div className="p-4 sm:p-6 md:p-0 space-y-4">
          {/* Title & Price Header */}
          <div>
            {allCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {allCategories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#ff2b75] border border-pink-100 hover:bg-pink-100 transition-colors"
                  >
                    <Tag size={10} />
                    <span>{cat}</span>
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Row: ₹999 ₹1,499 33% OFF */}
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">
                ₹{mrp}
              </span>
              {discountPercent > 0 && (
                <span className="bg-pink-100 text-[#ff2b75] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500 font-medium">
              <div className="flex items-center text-amber-400">
                <Star size={14} fill="currentColor" />
              </div>
              <span className="font-bold text-gray-800">4.7</span>
              <span>(120 reviews)</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Select Size / Age Group Section */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-gray-900">Select Age / Size:</span>
                <span className="text-xs font-bold text-[#ff2b75]">{selectedSize}</span>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-[#ff2b75] flex items-center gap-1 hover:underline"
              >
                <Ruler size={13} />
                <span>Size Chart</span>
              </button>
            </div>

            {/* Age Group Pills */}
            <div className="flex flex-wrap gap-2">
              {availableAgeGroups.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-pink-50 border-2 border-[#ff2b75] text-[#ff2b75] shadow-xs scale-102"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart / Buy Now Buttons */}
          {(() => {
            const effectiveMaxSelectable =
              typeof remainingStock === "number"
                ? Math.max(1, remainingStock)
                : maxStock;
            const isAtMaxLimit =
              typeof effectiveMaxSelectable === "number" &&
              quantity >= effectiveMaxSelectable;
            const isCartAlreadyFull =
              typeof remainingStock === "number" && remainingStock <= 0 && !isOutOfStock;

            return (
              <div className="space-y-2 pt-2">
                {typeof maxStock === "number" && (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {isOutOfStock ? (
                      <span className="text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        In Stock: Only {maxStock} available
                        {inCartQty > 0 ? ` (${inCartQty} in cart)` : ""}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl p-1 bg-gray-50 self-start sm:self-auto">
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-extrabold text-sm text-gray-900">
                      {isOutOfStock ? 0 : Math.min(quantity, effectiveMaxSelectable ?? quantity)}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock || isAtMaxLimit || isCartAlreadyFull}
                      onClick={() => {
                        if (typeof effectiveMaxSelectable === "number") {
                          setQuantity(Math.min(effectiveMaxSelectable, quantity + 1));
                        } else {
                          setQuantity(quantity + 1);
                        }
                      }}
                      title={
                        isAtMaxLimit
                          ? `Maximum available stock (${maxStock}) reached`
                          : "Increase quantity"
                      }
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock || isCartAlreadyFull}
                      onClick={handleAddToCart}
                      className="flex-1 bg-pink-50 hover:bg-pink-100 text-[#ff2b75] border border-pink-200 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ShoppingCart size={15} />
                      <span>
                        {isOutOfStock
                          ? "Out of Stock"
                          : isCartAlreadyFull
                          ? `Max ${maxStock} in Cart`
                          : "Add to Cart"}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className="flex-1 bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Added to Cart Toast Notification with View Cart Link */}
          {addedToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <Check size={15} className="text-emerald-600" />
                <span>Added to cart!</span>
              </div>
              <Link
                href="/cart"
                className="bg-[#ff2b75] hover:bg-[#e01d62] text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold shadow-2xs transition-colors shrink-0"
              >
                View Cart &rarr;
              </Link>
            </div>
          )}

          {/* Expandable Accordions */}
          <div className="pt-2 divide-y divide-gray-100 border-t border-gray-100">
            {/* Product Details Accordion */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("details")}
                className="w-full flex justify-between items-center text-xs sm:text-sm font-bold text-gray-900"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#ff2b75]" />
                  Product Details
                </span>
                {openAccordion === "details" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === "details" && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed space-y-1.5 pl-6">
                  <p>{product.description || "Crafted with love from hypoallergenic breathable organic fabrics. Gentle on delicate baby skin."}</p>
                  <p>• Premium imported lace and soft inner lining</p>
                  <p>• Snap buttons for hassle-free dressing and diaper changes</p>
                </div>
              )}
            </div>

            {/* Material & Care Accordion */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("care")}
                className="w-full flex justify-between items-center text-xs sm:text-sm font-bold text-gray-900"
              >
                <span className="flex items-center gap-2">
                  🧺 Material & Care
                </span>
                {openAccordion === "care" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === "care" && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed space-y-1 pl-6">
                  <p>• 100% Organic Combed Cotton</p>
                  <p>• Machine wash cold gentle cycle</p>
                  <p>• Do not bleach, tumble dry low</p>
                </div>
              )}
            </div>

            {/* Delivery & Returns Accordion */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion("returns")}
                className="w-full flex justify-between items-center text-xs sm:text-sm font-bold text-gray-900"
              >
                <span className="flex items-center gap-2">
                  🚚 Delivery & Returns
                </span>
                {openAccordion === "returns" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === "returns" && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed space-y-1 pl-6">
                  <p>• Free shipping on all orders above ₹999</p>
                  <p>• Estimated delivery: 3-5 business days across India</p>
                  <p>• 7-day hassle-free return and exchange policy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </main>
  );
}
