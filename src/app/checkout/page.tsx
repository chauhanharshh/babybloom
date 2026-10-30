"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight,
  Lock, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  CheckCircle2,
  MapPin,
  X,
  Phone,
  User,
  ShoppingBag,
  Copy,
  Check,
  QrCode,
  MessageCircle,
  AlertTriangle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { StoreProfileData } from "@/lib/profile";

export interface AddressData {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  cityStateZip: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, totalItems, clearCart, appliedCoupon } = useCart();

  // Store profile and dynamic payment settings
  const [storeProfile, setStoreProfile] = useState<StoreProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Address state - Empty by default (no hardcoded/prefilled dummy data)
  const [address, setAddress] = useState<AddressData>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    cityStateZip: "",
  });

  // Modal for adding / changing address
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Load customer address from localStorage if previously entered
  useEffect(() => {
    try {
      const saved = localStorage.getItem("babybloom_customer_address");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.line1) {
          setAddress(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Selected payment method - initialized to empty until store profile loads
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; total: number } | null>(null);

  // Fetch store payment settings & profile
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.success && data.profile) {
          const p: StoreProfileData = data.profile;
          setStoreProfile(p);
          // Auto-select first active payment method
          if (p.codEnabled) {
            setPaymentMethod("cod");
          } else if (p.upiEnabled) {
            setPaymentMethod("upi");
          } else if (p.cardEnabled) {
            setPaymentMethod("card");
          } else if (p.netbankingEnabled) {
            setPaymentMethod("netbanking");
          } else {
            setPaymentMethod("");
          }
        }
      } catch (err) {
        console.warn("Could not load payment settings:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchSettings();
  }, []);

  // Safe payment selection helper: Prevents selecting disabled payment methods
  const handleSelectPaymentMethod = (method: "cod" | "upi" | "card" | "netbanking") => {
    if (!storeProfile) return;
    if (method === "cod" && !storeProfile.codEnabled) return;
    if (method === "upi" && !storeProfile.upiEnabled) return;
    if (method === "card" && !storeProfile.cardEnabled) return;
    if (method === "netbanking" && !storeProfile.netbankingEnabled) return;
    setPaymentMethod(method);
  };

  const discount = appliedCoupon ? Math.round(totalPrice * (appliedCoupon.percent / 100)) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);
  const displaySubtotal = totalPrice;
  const displayTotal = finalTotal;
  const displayItemsCount = totalItems;

  const handleSaveAddress = (newAddress: AddressData) => {
    setAddress(newAddress);
    setIsAddressModalOpen(false);
    try {
      localStorage.setItem("babybloom_customer_address", JSON.stringify(newAddress));
    } catch {
      // ignore
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty! Please add products before placing an order.");
      return;
    }

    // Require address & email before placing order
    if (
      !address.name.trim() ||
      !address.email.trim() ||
      !address.phone.trim() ||
      !address.line1.trim() ||
      !address.cityStateZip.trim()
    ) {
      alert("Please enter your complete delivery address and email address before placing your order.");
      setIsAddressModalOpen(true);
      return;
    }

    // Require a valid selected payment method
    if (!paymentMethod) {
      alert("Please select an available payment method.");
      return;
    }

    // Validate that selected payment method is enabled by store
    if (storeProfile) {
      if (paymentMethod === "cod" && !storeProfile.codEnabled) {
        alert("Cash on Delivery is currently disabled by store. Please select another payment method.");
        return;
      }
      if (paymentMethod === "upi" && !storeProfile.upiEnabled) {
        alert("UPI payment is currently disabled by store. Please select another payment method.");
        return;
      }
      if (paymentMethod === "card" && !storeProfile.cardEnabled) {
        alert("Card payment is currently disabled by store. Please select another payment method.");
        return;
      }
      if (paymentMethod === "netbanking" && !storeProfile.netbankingEnabled) {
        alert("Net Banking is currently disabled by store. Please select another payment method.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart;
      const payload = JSON.stringify({
        cart: orderItems,
        customerName: address.name,
        customerEmail: address.email,
        address: `${address.line1} ${address.line2} ${address.cityStateZip}`,
        phone: address.phone,
        paymentMethod,
      });

      let res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      // Automatic retry once if cold start or transient DB wake-up occurred
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 600));
        res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess({ id: data.orderId, total: displayTotal });
        clearCart();
      } else {
        alert("Could not place order: " + (data.error || "Please try again"));
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/70 flex flex-col pb-12">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Screen 8 Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-gray-800 hover:text-[#ff2b75] transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-base font-extrabold text-gray-900 tracking-tight">Checkout</span>
        </div>

        {/* Small Babybloom branding on right */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs flex-shrink-0">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="Babybloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-sm font-extrabold text-[#ff2b75]">Babybloom</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1">
        {/* Desktop Page Title (Single H1 in DOM across mobile & desktop) */}
        <div className="sr-only md:not-sr-only md:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Review your delivery address, select a payment method and place your order</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="text-[#ff2b75]">1. Address</span>
            <span>&rarr;</span>
            <span className="text-[#ff2b75]">2. Payment</span>
            <span>&rarr;</span>
            <span className="text-gray-400">3. Confirmation</span>
          </div>
        </div>

        {/* Success Modal / Banner if order placed */}
        {orderSuccess ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg text-center space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
              <p className="text-xs text-gray-500 mt-1">
                Order ID: <span className="font-bold text-gray-800">#{orderSuccess.id}</span>
              </p>
            </div>
            <div className="bg-pink-50/50 rounded-2xl p-4 text-left text-xs space-y-1.5 border border-pink-100/60">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total Amount:</span>
                <span className="text-[#ff2b75]">₹{orderSuccess.total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment:</span>
                <span className="font-semibold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Deliver to:</span>
                <span className="font-semibold">{address.name}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Email:</span>
                <span className="font-semibold text-gray-800">{address.email}</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`https://wa.me/${(storeProfile?.whatsappNumber || "919520042719").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${storeProfile?.storeName || "Babybloom"}, I have placed order #${orderSuccess.id} for ₹${orderSuccess.total}. Please confirm!`)}`}
                target="_blank"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                Confirm on WhatsApp
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold text-xs text-center transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-pink-100 shadow-sm text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Your Cart is Empty</h2>
            <p className="text-xs text-gray-500">Please add items from our store before proceeding to checkout.</p>
            <div className="pt-2">
              <Link 
                href="/shop" 
                className="inline-block bg-[#ff2b75] hover:bg-[#e01d62] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xs transition-colors"
              >
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Address & Payment Method) */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Delivery Address */}
              {/* 1. Delivery Address */}
              <section className="space-y-2">
                <div className="flex justify-between items-center px-0.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                    1. Delivery Address
                  </h2>
                  {address.name && address.line1 && (
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-bold text-[#ff2b75] hover:text-[#e01d62] flex items-center gap-0.5 transition-colors"
                    >
                      <span>Change</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {/* Delivery Address Card: Shows saved address or interactive prompt to add address */}
                {address.name && address.line1 ? (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-start gap-3.5">
                    {/* Active Pink Radio Button */}
                    <div className="mt-1 w-4 h-4 rounded-full border-2 border-[#ff2b75] flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />
                    </div>

                    {/* Address Text */}
                    <div className="text-xs space-y-1 text-gray-600 flex-1">
                      <p className="font-bold text-gray-900 text-[13px] sm:text-sm">{address.name}</p>
                      <p className="font-medium text-gray-700">{address.phone} {address.email ? `• ${address.email}` : ""}</p>
                      <div className="leading-relaxed text-gray-500 pt-0.5">
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>{address.cityStateZip}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-bold text-[#ff2b75] hover:text-[#e01d62] px-2 py-1 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsAddressModalOpen(true)}
                    className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-dashed border-pink-200 hover:border-[#ff2b75] cursor-pointer text-center space-y-2 transition-all hover:bg-pink-50/20 group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-pink-50 text-[#ff2b75] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#ff2b75] transition-colors">
                        + Add Delivery Address
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Click here to enter your delivery address & contact details
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Payment Method */}
              <section className="space-y-2">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight px-0.5">
                  2. Payment Method
                </h2>

                {/* Payment Methods Card with Dynamic On/Off settings from Store Profile */}
                {loadingProfile ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-2">
                    <div className="w-5 h-5 border-2 border-[#ff2b75] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-500">Loading payment options...</p>
                  </div>
                ) : storeProfile &&
                  !storeProfile.codEnabled &&
                  !storeProfile.upiEnabled &&
                  !storeProfile.cardEnabled &&
                  !storeProfile.netbankingEnabled ? (
                  <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 space-y-1">
                        <p className="font-bold">Online Checkout Temporarily Paused</p>
                        <p className="text-amber-700">
                          Online checkout is temporarily paused for this store. You can place your order directly via WhatsApp!
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${storeProfile.whatsappNumber || "919520042719"}?text=${encodeURIComponent("Hi Babybloom! I want to place an order from your website.")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <MessageCircle size={15} />
                      <span>Order Directly on WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-50 overflow-hidden">
                    {/* Option 1: Cash on Delivery (COD) */}
                    {storeProfile?.codEnabled ? (
                      <div className={`transition-colors ${paymentMethod === "cod" ? "bg-emerald-50/20" : ""}`}>
                        <label 
                          onClick={() => handleSelectPaymentMethod("cod")}
                          className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === "cod" ? "border-[#ff2b75]" : "border-gray-300"
                          }`}>
                            {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Banknote size={16} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-bold text-gray-800">
                                Cash on Delivery (COD)
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                Available
                              </span>
                            </div>
                            {storeProfile?.codNote && paymentMethod === "cod" && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                {storeProfile.codNote}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-gray-50/70 opacity-45 cursor-not-allowed select-none">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-100 shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <Banknote size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 line-through">
                              Cash on Delivery (COD)
                            </span>
                            <p className="text-[10px] text-gray-400">Currently disabled by store</p>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Option 2: UPI (GPay, PhonePe, Paytm) */}
                    {storeProfile?.upiEnabled ? (
                      <div className={`transition-colors ${paymentMethod === "upi" ? "bg-orange-50/20" : ""}`}>
                        <label 
                          onClick={() => handleSelectPaymentMethod("upi")}
                          className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === "upi" ? "border-[#ff2b75]" : "border-gray-300"
                          }`}>
                            {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ff2b75] flex items-center justify-center shrink-0">
                            <Smartphone size={16} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-bold text-gray-800">
                                UPI (GPay, PhonePe, Paytm)
                              </span>
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                                Instant
                              </span>
                            </div>
                          </div>
                        </label>

                        {/* Expanded UPI Details when selected */}
                        {paymentMethod === "upi" && storeProfile?.upiId && (
                          <div className="px-4 pb-4 pt-1 ml-9 mr-4">
                            <div className="p-3 bg-white rounded-xl border border-orange-200 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Pay to UPI ID:</span>
                                <div className="flex items-center gap-1.5">
                                  <code className="font-mono font-bold text-[#ff2b75] bg-pink-50 px-2 py-0.5 rounded">
                                    {storeProfile.upiId}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (storeProfile.upiId) {
                                        navigator.clipboard.writeText(storeProfile.upiId);
                                        setCopiedUpi(true);
                                        setTimeout(() => setCopiedUpi(false), 2000);
                                      }
                                    }}
                                    className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-1"
                                  >
                                    {copiedUpi ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                    <span>{copiedUpi ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              </div>

                              {storeProfile.upiQrUrl && (
                                <div className="pt-2 text-center">
                                  <p className="text-[11px] text-gray-500 mb-1.5">Scan QR to pay:</p>
                                  <div className="relative w-32 h-32 mx-auto bg-white rounded-lg border border-gray-200 p-1">
                                    <Image
                                      src={storeProfile.upiQrUrl}
                                      alt="UPI QR Code"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              )}
                              <p className="text-[10px] text-gray-400">
                                After placing your order, please share your payment receipt via the WhatsApp confirm button.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-gray-50/70 opacity-45 cursor-not-allowed select-none">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-100 shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <Smartphone size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 line-through">
                              UPI (GPay, PhonePe, Paytm)
                            </span>
                            <p className="text-[10px] text-gray-400">UPI is currently disabled</p>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Option 3: Credit/Debit Card */}
                    {storeProfile?.cardEnabled ? (
                      <label 
                        onClick={() => handleSelectPaymentMethod("card")}
                        className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === "card" ? "border-[#ff2b75]" : "border-gray-300"
                        }`}>
                          {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <CreditCard size={16} />
                        </div>

                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-gray-800">
                            Credit / Debit Card
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                            Cards
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-gray-50/70 opacity-45 cursor-not-allowed select-none">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-100 shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <CreditCard size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 line-through">
                              Credit / Debit Card
                            </span>
                            <p className="text-[10px] text-gray-400">Card payments are disabled</p>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Option 4: Net Banking */}
                    {storeProfile?.netbankingEnabled ? (
                      <div className={`transition-colors ${paymentMethod === "netbanking" ? "bg-purple-50/20" : ""}`}>
                        <label 
                          onClick={() => handleSelectPaymentMethod("netbanking")}
                          className="flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === "netbanking" ? "border-[#ff2b75]" : "border-gray-300"
                          }`}>
                            {paymentMethod === "netbanking" && <div className="w-2 h-2 rounded-full bg-[#ff2b75]" />}
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Landmark size={16} />
                          </div>

                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-gray-800">
                              Net Banking
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                              Bank Transfer
                            </span>
                          </div>
                        </label>

                        {/* Bank Details when Netbanking selected */}
                        {paymentMethod === "netbanking" && (storeProfile?.bankName || storeProfile?.accountNumber) && (
                          <div className="px-4 pb-4 pt-1 ml-9 mr-4">
                            <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1 text-xs">
                              <p className="font-bold text-gray-800">Bank Transfer Details:</p>
                              {storeProfile.bankName && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Bank:</span>
                                  <span className="font-semibold text-gray-800">{storeProfile.bankName}</span>
                                </div>
                              )}
                              {storeProfile.accountHolderName && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Account Holder:</span>
                                  <span className="font-semibold text-gray-800">{storeProfile.accountHolderName}</span>
                                </div>
                              )}
                              {storeProfile.accountNumber && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Account No:</span>
                                  <span className="font-mono font-semibold text-gray-900">{storeProfile.accountNumber}</span>
                                </div>
                              )}
                              {storeProfile.ifscCode && (
                                <div className="flex justify-between text-gray-600">
                                  <span>IFSC Code:</span>
                                  <span className="font-mono font-semibold text-gray-900">{storeProfile.ifscCode}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-gray-50/70 opacity-45 cursor-not-allowed select-none">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-100 shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <Landmark size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 line-through">
                              Net Banking
                            </span>
                            <p className="text-[10px] text-gray-400">Net banking is currently disabled</p>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column (Order Summary & Place Order Button) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {/* 3. Order Summary */}
              <section className="space-y-2">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight px-0.5">
                  3. Order Summary
                </h2>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                    <span>Subtotal ({displayItemsCount} items)</span>
                    <span className="text-gray-900 font-bold">₹{displaySubtotal}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs sm:text-sm text-green-600 font-semibold">
                      <span>Coupon Discount ({appliedCoupon.code} - {appliedCoupon.percent}%)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
                  </div>

                  <hr className="border-gray-100 my-1" />

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Total Amount</span>
                    <span className="text-base sm:text-lg font-black text-gray-900">₹{displayTotal}</span>
                  </div>
                </div>
              </section>

              {/* Place Order Button */}
              <div className="pt-1 pb-6 lg:pb-0">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    isSubmitting ||
                    Boolean(
                      storeProfile &&
                      !storeProfile.codEnabled &&
                      !storeProfile.upiEnabled &&
                      !storeProfile.cardEnabled &&
                      !storeProfile.netbankingEnabled
                    )
                  }
                  className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                >
                  <Lock size={15} />
                  <span>
                    {isSubmitting
                      ? "Placing Order..."
                      : !address.name.trim() || !address.line1.trim()
                      ? "Enter Delivery Address"
                      : storeProfile &&
                        !storeProfile.codEnabled &&
                        !storeProfile.upiEnabled &&
                        !storeProfile.cardEnabled &&
                        !storeProfile.netbankingEnabled
                      ? "Payments Disabled"
                      : `Place Order • ₹${displayTotal}`}
                  </span>
                </button>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  🔒 100% Safe & Secure Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        initialAddress={address}
        onSave={handleSaveAddress}
        onClose={() => setIsAddressModalOpen(false)}
      />
      <div className="hidden md:block">
        <Footer />
      </div>
    </main>
  );
}

interface AddressModalProps {
  isOpen: boolean;
  initialAddress: AddressData;
  onSave: (address: AddressData) => void;
  onClose: () => void;
}

function AddressModal({ isOpen, initialAddress, onSave, onClose }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressData>(initialAddress);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialAddress);
    }
  }, [isOpen, initialAddress]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.line1.trim() ||
      !formData.cityStateZip.trim()
    ) {
      alert("Please fill in Full Name, Email Address, Phone, Address, and City/Pincode.");
      return;
    }
    onSave(formData);
  };

  const isEditing = Boolean(initialAddress.name && initialAddress.line1);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-extrabold text-base text-gray-900">
            {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              Email Address (For Order Approval Mail) *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">House No. / Flat / Street *</label>
            <input
              type="text"
              required
              placeholder="e.g. House No. 41, Street 3"
              value={formData.line1}
              onChange={(e) => setFormData((prev) => ({ ...prev, line1: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Landmark / Area (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Near Kaushik Academy"
              value={formData.line2}
              onChange={(e) => setFormData((prev) => ({ ...prev, line2: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">City, Pincode & State *</label>
            <input
              type="text"
              required
              placeholder="e.g. Haridwar - 249401, Uttarakhand"
              value={formData.cityStateZip}
              onChange={(e) => setFormData((prev) => ({ ...prev, cityStateZip: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff2b75]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#ff2b75] hover:bg-[#e01d62] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
