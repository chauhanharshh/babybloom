"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import LazyImage from "@/components/LazyImage";
import {
  Image as ImageIcon,
  BadgePercent,
  Plus,
  Trash2,
  Edit2,
  X,
  UploadCloud,
  Loader2,
  ExternalLink,
  Check,
  Search,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  AlertCircle,
  Percent,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Banner = {
  id: number;
  imageUrl: string;
  title: string | null;
  alt: string | null;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  ageGroup: string;
  imageUrl: string | null;
};

type Offer = {
  id: number;
  title: string;
  description: string | null;
  discountPercent: number;
  scope: string; // "SITEWIDE" | "PRODUCTS" | "CATEGORY"
  targetCategory: string | null;
  productIds: number[];
  couponCode: string | null;
  bannerText: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function OffersAndBannersPage() {
  const [activeTab, setActiveTab] = useState<"banners" | "offers">("banners");

  // Data states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Themed Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info";
    isAlertOnly?: boolean;
    isLoading?: boolean;
    action?: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const openConfirm = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info";
    action: () => Promise<void> | void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "Delete",
      type: opts.type || "danger",
      isAlertOnly: false,
      isLoading: false,
      action: opts.action,
    });
  };

  const openAlert = (
    title: string,
    message: string,
    type: "danger" | "warning" | "info" = "danger"
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText: "OK",
      type,
      isAlertOnly: true,
      isLoading: false,
      action: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // Banner Modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const [bannerForm, setBannerForm] = useState({
    imageUrl: "",
    title: "",
    alt: "",
    linkUrl: "/shop",
    order: 1,
    isActive: true,
  });

  // Offer Modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    discountPercent: 15,
    scope: "SITEWIDE" as "SITEWIDE" | "PRODUCTS" | "CATEGORY",
    targetCategory: "Girls",
    productIds: [] as number[],
    couponCode: "",
    bannerText: "",
    isActive: true,
  });

  // Fetch initial data
  useEffect(() => {
    fetchBanners();
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (Array.isArray(data)) setOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // Cloudinary upload
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "bb_uploads");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/x3mloqgq/image/upload",
      { method: "POST", body: data }
    );
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const json = await res.json();
    return json.secure_url as string;
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    setBannerUploadError("");
    try {
      const url = await uploadToCloudinary(file);
      setBannerForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Banner upload failed", err);
      setBannerUploadError("Upload fail hua. Image URL paste karo ya dobara try karo.");
    } finally {
      setBannerUploading(false);
      if (bannerFileRef.current) bannerFileRef.current.value = "";
    }
  };

  // BANNER HANDLERS
  const handleOpenBannerModal = (banner: Banner | null = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        imageUrl: banner.imageUrl,
        title: banner.title || "",
        alt: banner.alt || "",
        linkUrl: banner.linkUrl || "/shop",
        order: banner.order,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        imageUrl: "",
        title: "",
        alt: "",
        linkUrl: "/shop",
        order: (banners.length || 0) + 1,
        isActive: true,
      });
    }
    setBannerUploadError("");
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.imageUrl) {
      setBannerUploadError("Kripya banner image upload karein ya URL daalein.");
      return;
    }
    setSavingBanner(true);
    try {
      if (editingBanner) {
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bannerForm),
        });
        const updated = await res.json();
        setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? updated : b)));
      } else {
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bannerForm),
        });
        const created = await res.json();
        setBanners((prev) => [...prev, created]);
      }
      setIsBannerModalOpen(false);
    } catch (err) {
      console.error("Failed to save banner", err);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBannerActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const updated = await res.json();
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    } catch (err) {
      console.error("Failed to toggle banner", err);
    }
  };

  const handleDeleteBanner = (id: number) => {
    openConfirm({
      title: "Delete Hero Banner?",
      message: "Kya aap sure hain ki aap is hero slider banner ko delete karna chahte hain? Website se ye banner remove ho jayega.",
      confirmText: "Yes, Delete Banner",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await fetch(`/api/banners/${id}`, { method: "DELETE" });
          setBanners((prev) => prev.filter((b) => b.id !== id));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Delete Failed", "Failed to delete banner: " + (err as Error).message);
        }
      },
    });
  };

  // OFFER HANDLERS
  const handleOpenOfferModal = (offer: Offer | null = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title,
        description: offer.description || "",
        discountPercent: offer.discountPercent,
        scope: (offer.scope as "SITEWIDE" | "PRODUCTS" | "CATEGORY") || "SITEWIDE",
        targetCategory: offer.targetCategory || "Girls",
        productIds: offer.productIds || [],
        couponCode: offer.couponCode || "",
        bannerText: offer.bannerText || "",
        isActive: offer.isActive,
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title: "",
        description: "",
        discountPercent: 20,
        scope: "SITEWIDE",
        targetCategory: "Girls",
        productIds: [],
        couponCode: "",
        bannerText: "",
        isActive: true,
      });
    }
    setProductSearch("");
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) {
      openAlert("Title Required", "Kripya offer ka title enter karein (e.g. Diwal Dhamaka, Flat 20% Off).", "warning");
      return;
    }
    setSavingOffer(true);
    try {
      if (editingOffer) {
        const res = await fetch(`/api/offers/${editingOffer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offerForm),
        });
        const updated = await res.json();
        setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? updated : o)));
      } else {
        const res = await fetch("/api/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offerForm),
        });
        const created = await res.json();
        setOffers((prev) => [created, ...prev]);
      }
      setIsOfferModalOpen(false);
    } catch (err) {
      console.error("Failed to save offer", err);
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOfferActive = async (offer: Offer) => {
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      const updated = await res.json();
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (err) {
      console.error("Failed to toggle offer", err);
    }
  };

  const handleDeleteOffer = (id: number) => {
    const targetOffer = offers.find((o) => o.id === id);
    const offerTitle = targetOffer?.title ? `"${targetOffer.title}"` : "this offer";

    openConfirm({
      title: "Delete Offer?",
      message: `Kya aap sure hain ki aap ${offerTitle} ko permanently delete karna chahte hain? Iske discounts disable ho jayenge.`,
      confirmText: "Yes, Delete Offer",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await fetch(`/api/offers/${id}`, { method: "DELETE" });
          setOffers((prev) => prev.filter((o) => o.id !== id));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Delete Failed", "Failed to delete offer: " + (err as Error).message);
        }
      },
    });
  };

  const toggleSelectProduct = (productId: number) => {
    setOfferForm((prev) => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const filteredModalProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <BadgePercent className="w-8 h-8 text-primary" />
            Offers & Banners
          </h1>
          <p className="text-gray-500 mt-1">
            Hero section ke banners badlo aur puri website ya particular products par offers chalayein.
          </p>
        </div>

        {/* Action Button for Active Tab */}
        {activeTab === "banners" ? (
          <button
            onClick={() => handleOpenBannerModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Hero Banner
          </button>
        ) : (
          <button
            onClick={() => handleOpenOfferModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Create New Offer
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "banners"
              ? "bg-primary text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Banners ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "offers"
              ? "bg-primary text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Offers & Discounts ({offers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO BANNERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-700">
              <span className="font-bold text-gray-900">Hero Section Banners:</span> Yahan se
              aap homepage slider ki images change, add ya update kar sakte hain. Active toggle ko
              use karke kisi bhi banner ko hide ya show kar sakte hain bina delete kiye.
            </div>
          </div>

          {/* Banners Grid / List */}
          {loadingBanners ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500">Loading hero banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No Banners Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1">
                Aapke hero section me abhi koi banner nahi hai. Naya banner add karein.
              </p>
              <button
                onClick={() => handleOpenBannerModal()}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add First Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                    banner.isActive ? "border-gray-200" : "border-gray-200 opacity-60 bg-gray-50/50"
                  }`}
                >
                  {/* Banner Image Preview */}
                  <div className="relative w-full aspect-[21/9] bg-gray-100 overflow-hidden border-b border-gray-100">
                    <LazyImage
                      src={banner.imageUrl}
                      alt={banner.alt || "Banner image"}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />

                    {/* Order Badge */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <span>Slide #{banner.order || index + 1}</span>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs ${
                          banner.isActive
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {banner.isActive ? "Live on Homepage" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {banner.title || "Hero Slider Banner"}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          Alt: {banner.alt || "Babybloom Banner"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary bg-pink-50 px-2 py-0.5 rounded-md shrink-0">
                        Link: {banner.linkUrl}
                      </span>
                    </div>
                  </div>

                  {/* Banner Actions Bar */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        banner.isActive
                          ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {banner.isActive ? "Disable Banner" : "Enable Banner"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenBannerModal(banner)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OFFERS & DISCOUNTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "offers" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-start gap-3">
            <Percent className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-700">
              <span className="font-bold text-gray-900">Offers & Discounts Engine:</span> Yahan
              se aap <span className="font-semibold text-primary">Puri Website</span> par flat
              discount chala sakte hain ya <span className="font-semibold text-primary">Particular Selected Products</span>{" "}
              par offer laga sakte hain. Active offer aate hi store par discounted prices aur offer
              badges automatic calculate ho jayenge!
            </div>
          </div>

          {/* Offers List */}
          {loadingOffers ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500">Loading offers...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
              <Tag className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No Offers Created Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1">
                Puri website ya selected products par discount chalane ke liye naya offer create
                karein.
              </p>
              <button
                onClick={() => handleOpenOfferModal()}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Offer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const targetProductNames = products
                  .filter((p) => offer.productIds.includes(p.id))
                  .map((p) => p.name);

                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                      offer.isActive
                        ? "border-pink-200 ring-1 ring-pink-100"
                        : "border-gray-200 opacity-60 bg-gray-50/60"
                    }`}
                  >
                    {/* Left: Offer Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Discount Tag */}
                        <span className="bg-gradient-to-r from-pink-500 to-[#ff2b75] text-white font-black text-sm px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          {offer.discountPercent}% OFF
                        </span>

                        {/* Scope Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            offer.scope === "SITEWIDE"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : offer.scope === "CATEGORY"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {offer.scope === "SITEWIDE"
                            ? "🌐 Entire Website (Site-Wide)"
                            : offer.scope === "CATEGORY"
                            ? `🏷️ Category: ${offer.targetCategory}`
                            : `👗 Particular Products (${offer.productIds.length} items)`}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            offer.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {offer.isActive ? "● Active Now" : "○ Paused"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>

                      {offer.description && (
                        <p className="text-xs text-gray-600 line-clamp-1">{offer.description}</p>
                      )}

                      {/* Particular products listing if applicable */}
                      {offer.scope === "PRODUCTS" && targetProductNames.length > 0 && (
                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="font-semibold text-gray-700">Applied on:</span>
                          {targetProductNames.slice(0, 3).map((name, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-medium"
                            >
                              {name}
                            </span>
                          ))}
                          {targetProductNames.length > 3 && (
                            <span className="text-gray-400 font-medium">
                              +{targetProductNames.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Promo Announcement Text preview */}
                      {offer.bannerText && (
                        <div className="text-xs bg-pink-50 text-pink-700 font-semibold px-2.5 py-1 rounded-lg border border-pink-100 inline-block">
                          Top Bar Announcement: {offer.bannerText}
                        </div>
                      )}

                      {offer.couponCode && (
                        <div className="text-xs text-gray-600">
                          Coupon Code:{" "}
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {offer.couponCode}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-stretch md:self-center justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <button
                        type="button"
                        onClick={() => handleToggleOfferActive(offer)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                          offer.isActive
                            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs"
                        }`}
                      >
                        {offer.isActive ? "Pause Offer" : "Activate Offer"}
                      </button>

                      <button
                        onClick={() => handleOpenOfferModal(offer)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT HERO BANNER */}
      {/* ========================================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Homepage hero slider ki image aur link set karein.
                </p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 overflow-y-auto space-y-5">
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Image <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => !bannerUploading && bannerFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl relative aspect-[21/9] flex flex-col items-center justify-center overflow-hidden transition-all group ${
                    bannerUploading
                      ? "border-primary/50 cursor-wait bg-gray-50"
                      : "border-gray-300 hover:border-primary hover:bg-pink-50/20 cursor-pointer bg-gray-50/60"
                  }`}
                >
                  {bannerUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-semibold text-primary">Uploading Banner...</p>
                    </div>
                  ) : bannerForm.imageUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                      <LazyImage
                        src={bannerForm.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4" /> Change Banner Image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 bg-white rounded-full shadow-xs flex items-center justify-center mx-auto mb-2 text-primary">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        Click to upload hero banner image
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Recommended ratio: 21:9 or 1920x800px
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={bannerFileRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    disabled={bannerUploading}
                  />
                </div>

                {bannerUploadError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{bannerUploadError}</p>
                )}

                {/* Direct Image URL input */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Or paste Image URL directly
                  </label>
                  <input
                    type="url"
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              {/* Title & Alt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Banner Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g. Festive Summer Collection"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alt Text (For SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.alt}
                    onChange={(e) => setBannerForm({ ...bannerForm, alt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g. Flat 50% discount on Kids Wear"
                  />
                </div>
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Click Destination (Link)
                </label>
                <div className="flex gap-2 mb-2">
                  {["/shop", "/girls", "/boys", "/newborn"].map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, linkUrl: path })}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                        bannerForm.linkUrl === path
                          ? "bg-pink-100 border-pink-300 text-primary"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {path}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="/shop or /girls or custom link"
                />
              </div>

              {/* Order & Active Switch */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Slide Sequence / Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bannerForm.order}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerForm.isActive}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary accent-[#ff2b75]"
                    />
                    <span className="text-xs font-bold text-gray-700">Show on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {savingBanner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingBanner ? "Save Changes" : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT OFFER */}
      {/* ========================================================================= */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingOffer ? "Edit Offer" : "Create New Offer"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Puri website ya specific products par discount chalao.
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="p-6 overflow-y-auto space-y-5">
              {/* Title & Discount % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Offer Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g. Mega Summer Sale"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Discount (% OFF) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min="1"
                      max="99"
                      value={offerForm.discountPercent}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          discountPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-bold text-primary"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Scope (Radio Choices) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Offer Kahan Chalana Hai? (Scope)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Entire Website */}
                  <div
                    onClick={() => setOfferForm({ ...offerForm, scope: "SITEWIDE" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      offerForm.scope === "SITEWIDE"
                        ? "border-primary bg-pink-50/40 text-primary shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🌐</span>
                      <span className="font-bold text-xs">Puri Website</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      All products par instant discount apply hoga.
                    </p>
                  </div>

                  {/* Particular Products */}
                  <div
                    onClick={() => setOfferForm({ ...offerForm, scope: "PRODUCTS" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      offerForm.scope === "PRODUCTS"
                        ? "border-primary bg-pink-50/40 text-primary shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">👗</span>
                      <span className="font-bold text-xs">Particular Products</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Chune hue products par hi offer chalega.
                    </p>
                  </div>

                  {/* Category */}
                  <div
                    onClick={() => setOfferForm({ ...offerForm, scope: "CATEGORY" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      offerForm.scope === "CATEGORY"
                        ? "border-primary bg-pink-50/40 text-primary shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🏷️</span>
                      <span className="font-bold text-xs">Category Wise</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Newborn, Girls ya Boys category par.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional: Category Selector */}
              {offerForm.scope === "CATEGORY" && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Target Category
                  </label>
                  <select
                    value={offerForm.targetCategory}
                    onChange={(e) => setOfferForm({ ...offerForm, targetCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="Girls">Girls Wear</option>
                    <option value="Boys">Boys Wear</option>
                    <option value="Newborn">Newborn (Baby Wear)</option>
                  </select>
                </div>
              )}

              {/* Conditional: Particular Products Multi-Picker */}
              {offerForm.scope === "PRODUCTS" && (
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-900">
                      Select Products ({offerForm.productIds.length} selected)
                    </label>
                    {offerForm.productIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, productIds: [] })}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search bar inside picker */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products to include in offer..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Product items scroll area */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-gray-100 bg-white p-2 rounded-lg border border-gray-200">
                    {filteredModalProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No products found</p>
                    ) : (
                      filteredModalProducts.map((p) => {
                        const selected = offerForm.productIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleSelectProduct(p.id)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                              selected ? "bg-pink-50 text-gray-900" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  selected
                                    ? "bg-primary border-primary text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {selected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>

                              <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden relative shrink-0">
                                {p.imageUrl ? (
                                  <LazyImage
                                    src={p.imageUrl}
                                    alt={p.name}
                                    fill
                                    loading="lazy"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-pink-100" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {p.category} · ₹{p.price}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-gray-700 shrink-0">
                              ₹{p.price}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Promo Announcement Bar Text & Coupon Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Announcement Bar Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={offerForm.bannerText}
                    onChange={(e) => setOfferForm({ ...offerForm, bannerText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g. 🎉 FESTIVE DHAMAKA: Flat 20% OFF Everything!"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={offerForm.couponCode}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, couponCode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 text-xs uppercase font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g. FESTIVE20"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Offer Description / Terms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                  placeholder="e.g. Valid on all orders until Sunday midnight."
                />
              </div>

              {/* Active Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary accent-[#ff2b75]"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Activate this offer immediately on website
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOffer}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {savingOffer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingOffer ? "Save Offer Changes" : "Launch Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Themed Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
        isAlertOnly={confirmDialog.isAlertOnly}
        isLoading={confirmDialog.isLoading}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        onCancel={() => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
