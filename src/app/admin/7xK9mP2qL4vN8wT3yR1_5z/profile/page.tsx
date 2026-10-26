"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Info,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Building,
  HelpCircle,
  Globe
} from "lucide-react";
import type { StoreProfileData } from "@/lib/profile";

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"store" | "payments" | "preview">("store");

  const [formData, setFormData] = useState<StoreProfileData>({
    storeName: "Baby Bloom",
    tagline: "Everyday outfits for your little trendsetters",
    ownerName: "Harsh Chauhan",
    phone: "+91 95200 42719",
    whatsappNumber: "919520042719",
    email: "babybloom.bb2024@gmail.com",
    addressLine1: "Khanna Nagar, House no. 41",
    addressLine2: "Opposite Kaushik Academy",
    city: "Haridwar",
    state: "Uttarakhand",
    pincode: "249401",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    aboutText: "Everyday outfits for your little trendsetters. Premium baby and kids wear for ages 0 to 6 years.",
    
    // Payments
    codEnabled: true,
    codNote: "Pay cash upon order delivery at your doorstep.",
    upiEnabled: true,
    upiId: "9520042719@upi",
    upiQrUrl: "",
    cardEnabled: true,
    netbankingEnabled: true,
    bankName: "State Bank of India",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "Baby Bloom",
  });

  const [initialData, setInitialData] = useState<StoreProfileData | null>(null);

  // Fetch initial profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        setFormData(data.profile);
        setInitialData(data.profile);
      } else {
        setErrorMessage(data.error || "Failed to load store profile");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setErrorMessage("Could not connect to server. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormData(data.profile);
        setInitialData(data.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorMessage(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMessage("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#ff2b75] animate-spin" />
        <p className="text-sm font-medium text-gray-500">Store Profile load ho raha hai...</p>
      </div>
    );
  }

  const enabledCount = [
    formData.codEnabled,
    formData.upiEnabled,
    formData.cardEnabled,
    formData.netbankingEnabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff2b75] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Store Profile & Payment Methods
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Apni dukaan ki details (Name, WhatsApp, Address) aur payment options (COD, UPI, Net Banking) ko on/off karein.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold text-white bg-[#ff2b75] hover:bg-[#e01d62] disabled:opacity-50 rounded-xl shadow-xs transition-all active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">
            Store Profile aur Payment Methods successfully update ho gaye hain! Checkout page par naye changes turant apply ho gaye hain.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${formData.codEnabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cash on Delivery</p>
              <p className={`text-xs font-bold ${formData.codEnabled ? "text-emerald-700" : "text-gray-400"}`}>
                {formData.codEnabled ? "Active (ON)" : "Disabled (OFF)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${formData.codEnabled ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${formData.upiEnabled ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UPI (GPay/Paytm)</p>
              <p className={`text-xs font-bold ${formData.upiEnabled ? "text-orange-700" : "text-gray-400"}`}>
                {formData.upiEnabled ? "Active (ON)" : "Disabled (OFF)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${formData.upiEnabled ? "bg-orange-500 animate-pulse" : "bg-gray-300"}`} />
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${formData.cardEnabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Debit/Credit Cards</p>
              <p className={`text-xs font-bold ${formData.cardEnabled ? "text-blue-700" : "text-gray-400"}`}>
                {formData.cardEnabled ? "Active (ON)" : "Disabled (OFF)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${formData.cardEnabled ? "bg-blue-500 animate-pulse" : "bg-gray-300"}`} />
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${formData.netbankingEnabled ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-400"}`}>
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Net Banking</p>
              <p className={`text-xs font-bold ${formData.netbankingEnabled ? "text-purple-700" : "text-gray-400"}`}>
                {formData.netbankingEnabled ? "Active (ON)" : "Disabled (OFF)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${formData.netbankingEnabled ? "bg-purple-500 animate-pulse" : "bg-gray-300"}`} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("store")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "store"
              ? "bg-[#ff2b75] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>1. Dukaan Details (Store Profile)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "payments"
              ? "bg-[#ff2b75] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Payment Methods ({enabledCount}/4 ON)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "preview"
              ? "bg-[#ff2b75] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3. Customer Live Preview</span>
        </button>
      </div>

      {/* TAB 1: STORE DETAILS */}
      {activeTab === "store" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Building className="w-5 h-5 text-[#ff2b75]" />
              <h2 className="text-base font-bold text-gray-900">Basic Store Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Store / Dukaan Name *
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="e.g. Baby Bloom"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Everyday outfits for your little trendsetters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Store Owner / Contact Person
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Harsh Chauhan"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>WhatsApp Number (Orders & Enquiries) *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Without &apos;+&apos; sign (e.g. 919520042719)</span>
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="919520042719"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 95200 42719"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Store Email (Order Alerts & Support)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="babybloom.bb2024@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <MapPin className="w-5 h-5 text-[#ff2b75]" />
              <h2 className="text-base font-bold text-gray-900">Shop / Warehouse Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Address Line 1 (Street / House No.)
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Khanna Nagar, House no. 41"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Address Line 2 (Landmark / Area)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Opposite Kaushik Academy"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Haridwar"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Uttarakhand"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="249401"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Bio */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Globe className="w-5 h-5 text-[#ff2b75]" />
              <h2 className="text-base font-bold text-gray-900">Social Media & About</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Instagram URL</label>
                <div className="relative">
                  <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/babybloom"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Facebook URL</label>
                <div className="relative">
                  <FacebookIcon className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/babybloom"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  About Store / Footer Description
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  placeholder="Short description of your baby clothing brand..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT METHODS ON/OFF */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#ff2b75] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">Payment Controls Guide:</p>
              <p>
                Aap jis payment method ko <span className="font-semibold text-emerald-600">ON</span> karenge, customer ko checkout page par wahi option dikhega. Agar aap kisi method ko <span className="font-semibold text-rose-600">OFF</span> karte hain, toh wo checkout se turant hat jayega.
              </p>
            </div>
          </div>

          {/* 1. Cash On Delivery (COD) Card */}
          <div className={`bg-white rounded-2xl border transition-all ${
            formData.codEnabled ? "border-emerald-200 shadow-sm" : "border-gray-200 opacity-80"
          }`}>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.codEnabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">Cash on Delivery (COD)</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.codEnabled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {formData.codEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Order deliver hone par customer cash pay karega.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.codEnabled}
                  onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-xs font-bold text-gray-700">
                  {formData.codEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {formData.codEnabled && (
              <div className="p-5 sm:p-6 bg-gray-50/50 rounded-b-2xl">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  COD Note / Customer Instruction (Shown on checkout)
                </label>
                <input
                  type="text"
                  value={formData.codNote}
                  onChange={(e) => setFormData({ ...formData, codNote: e.target.value })}
                  placeholder="e.g. Pay in cash when order arrives at your doorstep."
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                />
              </div>
            )}
          </div>

          {/* 2. UPI Payments (GPay, PhonePe, Paytm) Card */}
          <div className={`bg-white rounded-2xl border transition-all ${
            formData.upiEnabled ? "border-orange-200 shadow-sm" : "border-gray-200 opacity-80"
          }`}>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.upiEnabled ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">UPI Payment (GPay, PhonePe, Paytm)</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.upiEnabled ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {formData.upiEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Customer seedhe aapke UPI ID ya QR code par payment kar sakta hai.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.upiEnabled}
                  onChange={(e) => setFormData({ ...formData, upiEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ml-3 text-xs font-bold text-gray-700">
                  {formData.upiEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {formData.upiEnabled && (
              <div className="p-5 sm:p-6 bg-gray-50/50 rounded-b-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Store UPI ID / VPA *</span>
                      <span className="text-[10px] text-gray-400 font-normal">e.g. 9520042719@paytm</span>
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="e.g. 9520042719@upi or babybloom@oksbi"
                      className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Customer ko checkout me yeh UPI ID dikhegi jisme wo GPay/PhonePe se pay karega.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      UPI QR Code Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.upiQrUrl}
                      onChange={(e) => setFormData({ ...formData, upiQrUrl: e.target.value })}
                      placeholder="https://.../my-upi-qr.jpg"
                      className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Credit / Debit Cards Card */}
          <div className={`bg-white rounded-2xl border transition-all ${
            formData.cardEnabled ? "border-blue-200 shadow-sm" : "border-gray-200 opacity-80"
          }`}>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.cardEnabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">Credit / Debit Cards</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.cardEnabled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {formData.cardEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Visa, Mastercard, RuPay & Maestro card payments enable ya disable karein.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.cardEnabled}
                  onChange={(e) => setFormData({ ...formData, cardEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-xs font-bold text-gray-700">
                  {formData.cardEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
          </div>

          {/* 4. Net Banking Card */}
          <div className={`bg-white rounded-2xl border transition-all ${
            formData.netbankingEnabled ? "border-purple-200 shadow-sm" : "border-gray-200 opacity-80"
          }`}>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.netbankingEnabled ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">Net Banking</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formData.netbankingEnabled ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {formData.netbankingEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bank accounts transfer aur direct internet banking.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.netbankingEnabled}
                  onChange={(e) => setFormData({ ...formData, netbankingEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-xs font-bold text-gray-700">
                  {formData.netbankingEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {formData.netbankingEnabled && (
              <div className="p-5 sm:p-6 bg-gray-50/50 rounded-b-2xl space-y-4">
                <p className="text-xs font-bold text-gray-700">Bank Details for Direct Transfers:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. State Bank of India, HDFC"
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="e.g. Baby Bloom Store"
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="e.g. 39482019485"
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER VIEW PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#ff2b75]" />
                Checkout Page Payment Options (Customer Preview)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Aapke upar kiye gaye on/off selections ke anusaar customer ko checkout page par aisi options dikhengi:
              </p>
            </div>

            {/* Simulated Checkout Payment Selection */}
            <div className="max-w-md mx-auto bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                Select Payment Method
              </h3>

              <div className="space-y-2 bg-white rounded-xl border border-gray-100 p-2 shadow-2xs divide-y divide-gray-50">
                {/* COD Option */}
                {formData.codEnabled ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Banknote size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
                      </div>
                      {formData.codNote && (
                        <p className="text-[11px] text-gray-500">{formData.codNote}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-400 bg-gray-50/60 rounded-lg flex items-center justify-between">
                    <span className="line-through">Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Disabled</span>
                  </div>
                )}

                {/* UPI Option */}
                {formData.upiEnabled ? (
                  <div className="flex items-start gap-3 p-3">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-1" />
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Smartphone size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">UPI (GPay, PhonePe, Paytm)</span>
                        <span className="text-[10px] text-orange-700 font-semibold bg-orange-100 px-1.5 py-0.5 rounded">Active</span>
                      </div>
                      {formData.upiId && (
                        <p className="text-[11px] text-[#ff2b75] font-semibold mt-0.5">UPI ID: {formData.upiId}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-400 bg-gray-50/60 rounded-lg flex items-center justify-between">
                    <span className="line-through">UPI (GPay, PhonePe, Paytm)</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Disabled</span>
                  </div>
                )}

                {/* Card Option */}
                {formData.cardEnabled ? (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard size={16} />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">Credit / Debit Card</span>
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-400 bg-gray-50/60 rounded-lg flex items-center justify-between">
                    <span className="line-through">Credit / Debit Card</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Disabled</span>
                  </div>
                )}

                {/* Net Banking Option */}
                {formData.netbankingEnabled ? (
                  <div className="flex items-start gap-3 p-3">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-1" />
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Landmark size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">Net Banking</span>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-1.5 py-0.5 rounded">Active</span>
                      </div>
                      {formData.bankName && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{formData.bankName} • Acc: {formData.accountNumber ? `••••${formData.accountNumber.slice(-4)}` : "Available"}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-400 bg-gray-50/60 rounded-lg flex items-center justify-between">
                    <span className="line-through">Net Banking</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Disabled</span>
                  </div>
                )}
              </div>

              {enabledCount === 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-center">
                  ⚠️ Saare payment methods OFF hain! Customer checkout nahi kar payenge. Kam se kam ek payment method ON rakhein.
                </div>
              )}
            </div>

            {/* Store Card Preview */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-pink-500 to-[#ff2b75] rounded-2xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">{formData.storeName}</h3>
                  <p className="text-xs text-white/90">{formData.tagline}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                  🌸
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="shrink-0 text-white/80" />
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={13} className="shrink-0 text-white/80" />
                  <span>WhatsApp: +{formData.whatsappNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="shrink-0 text-white/80" />
                  <span className="truncate">{formData.addressLine1}, {formData.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar when user changes anything */}
      {hasChanges && (
        <div className="sticky bottom-4 z-40 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">Unsaved changes hain! Save karna na bhoolein.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-gray-300 hover:text-white transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ff2b75] hover:bg-[#e01d62] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
