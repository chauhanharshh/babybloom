"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Check
} from "lucide-react";
import { useCart, Product } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface ProductDetailsClientProps {
  product: Product & { mrp?: number; description?: string | null };
}

const SIZES = ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y"];

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, totalItems } = useCart();
  const [selectedSize, setSelectedSize] = useState("1-2Y");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [addedToast, setAddedToast] = useState(false);

  const isLiked = isInWishlist(product.id);
  const mrp = product.mrp || Math.round(product.price * 1.5);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  // Gallery images (use primary image + secondary angles)
  const images = [
    product.imageUrl || "/images/products/party-frock.jpg",
    product.imageUrl || "/images/products/party-frock.jpg",
    product.imageUrl || "/images/products/party-frock.jpg",
    product.imageUrl || "/images/products/party-frock.jpg",
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, `${selectedSize} / Standard`);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
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
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
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
            </div>

            {/* Desktop Thumbnails */}
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
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details Body */}
          <div className="p-4 sm:p-6 md:p-0 space-y-4">
          {/* Title & Price Header */}
          <div>
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

          {/* Select Size Section */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs sm:text-sm font-extrabold text-gray-900">Select Size</span>
              <button
                type="button"
                className="text-xs font-bold text-[#ff2b75] flex items-center gap-1 hover:underline"
              >
                <Ruler size={13} />
                <span>Size Chart</span>
              </button>
            </div>

            {/* Size Pills */}
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-pink-50 border-2 border-[#ff2b75] text-[#ff2b75] shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart Button */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-xs active:scale-95"
              >
                <Minus size={13} />
              </button>
              <span className="w-8 text-center font-extrabold text-sm text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:text-[#ff2b75] shadow-xs active:scale-95"
              >
                <Plus size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 active:scale-98 transition-all"
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Added to Cart Toast Notification */}
          {addedToast && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check size={16} />
              <span>Added to your cart successfully!</span>
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
