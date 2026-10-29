"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  FolderTree, 
  Tag, 
  Layers, 
  Loader2, 
  Check, 
  Package,
  AlertCircle,
  UploadCloud,
  ImageIcon,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Baby
} from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LazyImage from "@/components/LazyImage";
import type { AgeRangeItem } from "@/lib/ageRanges";
import { sortAgeRanges } from "@/utils/ageRanges";

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount?: number;
  subcategories: Subcategory[];
};

export default function AdminCategories() {
  // Tab Switcher: "categories" | "age-ranges"
  const [activeTab, setActiveTab] = useState<"categories" | "age-ranges">("categories");

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Age Ranges State
  const [ageRanges, setAgeRanges] = useState<AgeRangeItem[]>([]);
  const [loadingAgeRanges, setLoadingAgeRanges] = useState(true);
  const [ageSearchQuery, setAgeSearchQuery] = useState("");
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [editingAgeRange, setEditingAgeRange] = useState<AgeRangeItem | null>(null);
  const [ageFormName, setAgeFormName] = useState("");
  const [ageSaving, setAgeSaving] = useState(false);
  const [ageError, setAgeError] = useState("");
  const [quickAgeInput, setQuickAgeInput] = useState("");
  const [quickAgeSaving, setQuickAgeSaving] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    subcategoriesInput: "",
  });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline Subcategory Adding State (map of categoryId -> input string)
  const [subInputs, setSubInputs] = useState<Record<number, string>>({});
  const [subAddingId, setSubAddingId] = useState<number | null>(null);
  const [subError, setSubError] = useState<{ catId: number; message: string } | null>(null);

  // Quick message toast
  const [toastMessage, setToastMessage] = useState("");

  // Custom Themed Confirm Dialog state
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

  useEffect(() => {
    fetchCategories();
    fetchAgeRanges();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const notifyCategoriesChanged = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bb_categories_sync", Date.now().toString());
        window.dispatchEvent(new CustomEvent("babybloom:categories-updated"));
      } catch {}
    }
  };

  // --- Categories API ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Age Ranges API ---
  const fetchAgeRanges = async () => {
    setLoadingAgeRanges(true);
    try {
      const res = await fetch(`/api/age-ranges?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAgeRanges(sortAgeRanges(data));
      }
    } catch (err) {
      console.error("Failed to fetch age ranges:", err);
    } finally {
      setLoadingAgeRanges(false);
    }
  };

  const handleOpenAgeModal = (range: AgeRangeItem | null = null) => {
    setAgeError("");
    if (range) {
      setEditingAgeRange(range);
      setAgeFormName(range.name);
    } else {
      setEditingAgeRange(null);
      setAgeFormName("");
    }
    setIsAgeModalOpen(true);
  };

  const handleCloseAgeModal = () => {
    setIsAgeModalOpen(false);
    setEditingAgeRange(null);
    setAgeFormName("");
    setAgeError("");
  };

  const handleSaveAgeRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageFormName.trim()) {
      setAgeError("Please enter an age range name");
      return;
    }
    setAgeSaving(true);
    setAgeError("");

    try {
      if (editingAgeRange) {
        const res = await fetch(`/api/age-ranges/${editingAgeRange.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: ageFormName.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update age range");

        setAgeRanges((prev) =>
          sortAgeRanges(
            prev.map((r) => (r.id === editingAgeRange.id ? { ...r, ...data } : r))
          )
        );
        showToast(`Age range updated to "${data.name}"!`);
      } else {
        const res = await fetch("/api/age-ranges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: ageFormName.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create age range");

        setAgeRanges((prev) => sortAgeRanges([...prev, data]));
        showToast(`New age range "${data.name}" added successfully!`);
      }
      handleCloseAgeModal();
    } catch (err) {
      setAgeError((err as Error).message);
    } finally {
      setAgeSaving(false);
    }
  };

  const handleQuickAddAgeRange = async (nameToAdd?: string) => {
    const rawName = (nameToAdd || quickAgeInput).trim();
    if (!rawName) return;

    setQuickAgeSaving(true);
    try {
      const res = await fetch("/api/age-ranges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rawName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add age range");

      setAgeRanges((prev) => sortAgeRanges([...prev, data]));
      setQuickAgeInput("");
      showToast(`Age range "${data.name}" added!`);
    } catch (err) {
      openAlert("Age Range Exists", (err as Error).message, "warning");
    } finally {
      setQuickAgeSaving(false);
    }
  };

  const handleDeleteAgeRange = (range: AgeRangeItem) => {
    const hasProducts = range.productCount && range.productCount > 0;
    const warning = hasProducts
      ? ` Note: There are ${range.productCount} product(s) linked to this age range.`
      : "";

    openConfirm({
      title: `Delete Age Range "${range.name}"?`,
      message: `Are you sure you want to delete the age range "${range.name}"?${warning}`,
      confirmText: "Yes, Delete",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/age-ranges/${range.id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete age range");
          }
          setAgeRanges((prev) => prev.filter((r) => r.id !== range.id));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(`Age range "${range.name}" deleted.`);
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Error Deleting Age Range", (err as Error).message);
        }
      },
    });
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q);
    const matchesSub = c.subcategories.some((s) => s.name.toLowerCase().includes(q));
    return matchesName || matchesSub;
  });

  const filteredAgeRanges = sortAgeRanges(
    ageRanges.filter((r) =>
      r.name.toLowerCase().includes(ageSearchQuery.toLowerCase())
    )
  );

  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const totalProductsInAgeGroups = ageRanges.reduce((sum, r) => sum + (r.productCount || 0), 0);
  const mostPopularAgeRange = [...ageRanges].sort((a, b) => (b.productCount || 0) - (a.productCount || 0))[0];

  // Presets for quick suggestions
  const AGE_PRESETS = [
    "0-3 Months",
    "3-6 Months",
    "6-12 Months",
    "0-1 Yrs",
    "1-2 Yrs",
    "2-3 Yrs",
    "3-4 Yrs",
    "4-5 Yrs",
    "5-6 Yrs",
    "6-7 Yrs",
    "7-8 Yrs",
    "8-9 Yrs",
    "9-10 Yrs",
    "10-12 Yrs"
  ];

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageUploadError("");
    try {
      const url = await uploadToCloudinary(file);
      setCategoryForm((prev) => ({ ...prev, imageUrl: url }));
      showToast("Category image successfully uploaded!");
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local base64 reader:", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCategoryForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
          showToast("Category image loaded from device!");
        }
        setImageUploading(false);
      };
      reader.onerror = () => {
        setImageUploadError("Image read failed. Please try another image or paste URL.");
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open modal for Create or Edit Category
  const handleOpenCategoryModal = (cat: Category | null = null) => {
    setCategoryError("");
    setImageUploadError("");
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
        subcategoriesInput: "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        imageUrl: "",
        subcategoriesInput: "Casual, Party Wear, Regular",
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryError("");
    setImageUploadError("");
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySaving(true);
    setCategoryError("");

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
            imageUrl: categoryForm.imageUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category");

        setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c)));
        notifyCategoriesChanged();
        showToast(`Category "${data.name}" updated successfully!`);
      } else {
        const subArray = categoryForm.subcategoriesInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
            imageUrl: categoryForm.imageUrl,
            subcategories: subArray,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category");

        setCategories([...categories, { ...data, productCount: 0 }]);
        notifyCategoriesChanged();
        showToast(`Category "${data.name}" created with ${data.subcategories?.length || 0} subcategories!`);
      }
      handleCloseCategoryModal();
    } catch (err) {
      setCategoryError((err as Error).message);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const hasProducts = cat.productCount && cat.productCount > 0;
    const countWarning = hasProducts
      ? ` Note: There are ${cat.productCount} product(s) in this category that may become uncategorized.`
      : "";

    openConfirm({
      title: `Delete Category "${cat.name}"?`,
      message: `Are you sure you want to delete the category "${cat.name}" and all its subcategories?${countWarning}`,
      confirmText: "Yes, Delete Category",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete category");
          }
          setCategories(categories.filter((c) => c.id !== cat.id));
          notifyCategoriesChanged();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(`Category "${cat.name}" deleted successfully.`);
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Error Deleting Category", (err as Error).message);
        }
      },
    });
  };

  // Add inline Subcategory
  const handleAddSubcategory = async (categoryId: number) => {
    const subName = (subInputs[categoryId] || "").trim();
    if (!subName) return;

    setSubAddingId(categoryId);
    setSubError(null);

    try {
      const res = await fetch(`/api/categories/${categoryId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add subcategory");

      setCategories(
        categories.map((c) => {
          if (c.id === categoryId) {
            return {
              ...c,
              subcategories: [...c.subcategories, data],
            };
          }
          return c;
        })
      );

      setSubInputs({ ...subInputs, [categoryId]: "" });
      notifyCategoriesChanged();
      showToast(`Added subcategory "${subName}"!`);
    } catch (err) {
      setSubError({ catId: categoryId, message: (err as Error).message });
    } finally {
      setSubAddingId(null);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = (categoryId: number, sub: Subcategory) => {
    openConfirm({
      title: `Delete Subcategory "${sub.name}"?`,
      message: `Are you sure you want to delete the subcategory "${sub.name}"?`,
      confirmText: "Yes, Delete",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/subcategories/${sub.id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete subcategory");
          }

          setCategories(
            categories.map((c) => {
              if (c.id === categoryId) {
                return {
                  ...c,
                  subcategories: c.subcategories.filter((s) => s.id !== sub.id),
                };
              }
              return c;
            })
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          notifyCategoriesChanged();
          showToast(`Subcategory "${sub.name}" removed.`);
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Error Deleting Subcategory", (err as Error).message);
        }
      },
    });
  };

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Navigation and Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            {activeTab === "categories" ? (
              <FolderTree className="w-7 h-7 text-[#ff2b75]" />
            ) : (
              <Baby className="w-7 h-7 text-[#ff2b75]" />
            )}
            <span>{activeTab === "categories" ? "Categories & Subcategories" : "Age Ranges & Sizes"}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {activeTab === "categories"
              ? "Create new categories, manage subcategories, and structure your babywear inventory."
              : "Define age ranges (e.g. 0-1 Yrs, 1-2 Yrs) to categorize products and make size selection easy."}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === "categories" ? (
            <button
              onClick={() => handleOpenCategoryModal()}
              className="bg-[#ff2b75] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e01d62] transition-colors shadow-[0_4px_14px_0_rgba(255,43,117,0.39)] hover:shadow-[0_6px_20px_rgba(255,43,117,0.23)] w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          ) : (
            <button
              onClick={() => handleOpenAgeModal()}
              className="bg-[#ff2b75] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e01d62] transition-colors shadow-[0_4px_14px_0_rgba(255,43,117,0.39)] hover:shadow-[0_6px_20px_rgba(255,43,117,0.23)] w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Age Range
            </button>
          )}
        </div>
      </div>

      {/* Top Segmented Tab Switcher */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center gap-1.5 max-w-md border border-gray-200/60">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <FolderTree className="w-4 h-4 text-[#ff2b75]" />
          <span>Categories</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === "categories" ? "bg-pink-100 text-[#ff2b75]" : "bg-gray-200 text-gray-600"
          }`}>
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("age-ranges")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "age-ranges"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <Baby className="w-4 h-4 text-[#ff2b75]" />
          <span>Age Ranges</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === "age-ranges" ? "bg-pink-100 text-[#ff2b75]" : "bg-gray-200 text-gray-600"
          }`}>
            {ageRanges.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATEGORIES & SUBCATEGORIES VIEW                                    */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Total Categories</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-[#ff2b75]">
                <FolderTree className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Subcategories</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalSubcategories}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Categorized Products</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Clickable Quick-Jump to Age Ranges */}
            <div
              onClick={() => setActiveTab("age-ranges")}
              className="bg-gradient-to-br from-pink-50/60 to-white rounded-xl border border-pink-200/60 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#ff2b75] transition-all group"
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#ff2b75]">Age Ranges</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{ageRanges.length}</p>
                <span className="text-[11px] font-bold text-[#ff2b75] flex items-center gap-1 mt-0.5 group-hover:underline">
                  Manage Ranges <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="w-12 h-12 bg-pink-100/60 rounded-xl flex items-center justify-center text-[#ff2b75] group-hover:scale-105 transition-transform">
                <Baby className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search category or subcategory name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
              />
            </div>
          </div>

          {/* Categories Cards List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
              <Loader2 className="w-8 h-8 text-[#ff2b75] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Loading categories & subcategories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#ff2b75]">
                <FolderTree className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                {searchQuery ? `No category matching "${searchQuery}"` : "Click below to create your very first category!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="mt-4 px-5 py-2.5 bg-[#ff2b75] text-white rounded-xl text-sm font-semibold hover:bg-[#e01d62] transition-colors cursor-pointer"
                >
                  + Create Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <LazyImage
                              src={cat.imageUrl}
                              alt={cat.name}
                              fill
                              loading="lazy"
                              className="object-cover"
                              fallbackText={cat.name}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ff2b75] font-extrabold text-lg shrink-0">
                            {cat.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#ff2b75] transition-colors">
                            {cat.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              slug: /{cat.slug}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              • {cat.productCount || 0} product{(cat.productCount || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}

                    {/* Subcategories Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                          <Tag className="w-3.5 h-3.5 text-[#ff2b75]" />
                          Subcategories ({cat.subcategories.length})
                        </span>
                      </div>

                      {/* Subcategory Badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                        {cat.subcategories.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">No subcategories yet</span>
                        ) : (
                          cat.subcategories.map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50/70 border border-pink-100 rounded-lg text-xs font-medium text-pink-700 hover:bg-pink-100 transition-colors"
                            >
                              <span>{sub.name}</span>
                              <button
                                onClick={() => handleDeleteSubcategory(cat.id, sub)}
                                className="text-pink-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                                title={`Delete ${sub.name}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Subcategory Error notice */}
                      {subError && subError.catId === cat.id && (
                        <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{subError.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Inline Quick Add Subcategory */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-100">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSubcategory(cat.id);
                      }}
                      className="flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder="+ Add subcategory (e.g. Frocks)..."
                        value={subInputs[cat.id] || ""}
                        onChange={(e) => setSubInputs({ ...subInputs, [cat.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff2b75] focus:border-[#ff2b75]"
                      />
                      <button
                        type="submit"
                        disabled={subAddingId === cat.id || !(subInputs[cat.id] || "").trim()}
                        className="px-3 py-1.5 bg-[#ff2b75] text-white text-xs font-semibold rounded-lg hover:bg-[#e01d62] transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {subAddingId === cat.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Add</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AGE RANGES VIEW                                                    */}
      {/* ========================================================================= */}
      {activeTab === "age-ranges" && (
        <div className="space-y-6">
          {/* Age Ranges Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Total Age Ranges</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{ageRanges.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Available for products</p>
              </div>
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-[#ff2b75]">
                <Baby className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Products in Age Groups</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalProductsInAgeGroups}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Categorized by size</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Most Popular Range</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {mostPopularAgeRange?.name || "None"}
                </p>
                <p className="text-[11px] text-[#ff2b75] font-semibold mt-0.5">
                  {mostPopularAgeRange ? `${mostPopularAgeRange.productCount || 0} Products` : "0 Products"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Add Age Range Box with Preset Suggestions */}
          <div className="bg-white rounded-2xl border border-pink-100/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#ff2b75]" />
                  <span>Create New Age Range</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Type a new age range or choose from the popular presets below.
                </p>
              </div>
            </div>

            {/* Inline Add Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickAddAgeRange();
              }}
              className="flex gap-2 max-w-xl"
            >
              <input
                type="text"
                placeholder="e.g. 6-7 Yrs, 0-3 Months, 7-8 Yrs..."
                value={quickAgeInput}
                onChange={(e) => setQuickAgeInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors font-medium"
              />
              <button
                type="submit"
                disabled={quickAgeSaving || !quickAgeInput.trim()}
                className="px-5 py-2.5 bg-[#ff2b75] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#e01d62] transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                {quickAgeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Range</span>
              </button>
            </form>

            {/* Popular Preset Chips */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Quick Preset Suggestions (Click to Add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AGE_PRESETS.map((preset) => {
                  const alreadyExists = ageRanges.some(
                    (r) => r.name.toLowerCase() === preset.toLowerCase()
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => handleQuickAddAgeRange(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        alreadyExists
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50"
                          : "bg-pink-50 text-[#ff2b75] border border-pink-100 hover:bg-[#ff2b75] hover:text-white"
                      }`}
                      title={alreadyExists ? "Already exists" : `Click to add ${preset}`}
                    >
                      <span>{preset}</span>
                      {alreadyExists ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Bar for Age Ranges */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search age ranges..."
                value={ageSearchQuery}
                onChange={(e) => setAgeSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
              />
            </div>
          </div>

          {/* Age Ranges Cards Grid */}
          {loadingAgeRanges ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
              <Loader2 className="w-8 h-8 text-[#ff2b75] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Loading age ranges...</p>
            </div>
          ) : filteredAgeRanges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#ff2b75]">
                <Baby className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No age ranges found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                {ageSearchQuery
                  ? `No age range matching "${ageSearchQuery}"`
                  : "Use the form or quick presets above to create a new age range."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAgeRanges.map((range) => (
                <div
                  key={range.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-pink-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 text-[#ff2b75] flex items-center justify-center shrink-0">
                        <Baby className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenAgeModal(range)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Age Range"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgeRange(range)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Age Range"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-[#ff2b75] transition-colors tracking-tight">
                        {range.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
                          <Package className="w-3 h-3 text-gray-500" />
                          <span>{range.productCount || 0} Products</span>
                        </span>
                        {(range.productCount || 0) > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            In Use
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>Range #{range.order || range.id}</span>
                    <span className="text-[#ff2b75] font-semibold text-[10px]">
                      {(range.productCount || 0) > 0 ? "Linked in store" : "Empty"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT AGE RANGE                                               */}
      {/* ========================================================================= */}
      {isAgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingAgeRange ? "Edit Age Range" : "Add New Age Range"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingAgeRange
                    ? "Update the age range name."
                    : "Create a new age range for your store catalog."}
                </p>
              </div>
              <button
                onClick={handleCloseAgeModal}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgeRange} className="p-5 space-y-4">
              {ageError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ageError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Age Range Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 6-7 Yrs, 0-3 Months, 7-8 Yrs"
                  value={ageFormName}
                  onChange={(e) => setAgeFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  This age group will appear in the dropdown when adding or editing products.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseAgeModal}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ageSaving}
                  className="px-5 py-2.5 bg-[#ff2b75] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#e01d62] transition-colors shadow-md disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {ageSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingAgeRange ? "Save Changes" : "Create Age Range"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY                                                */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingCategory
                    ? "Update category details and image."
                    : "Create a new category with its initial subcategories."}
                </p>
              </div>
              <button
                onClick={handleCloseCategoryModal}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto">
              {categoryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Footwear, Toys, Winter Wear"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors resize-none"
                />
              </div>

              {/* Category Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Category Image (Optional)
                  </label>
                  {categoryForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, imageUrl: "" })}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {imageUploadError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageUploadError}</span>
                  </div>
                )}

                {/* Local Upload Dropzone */}
                <div
                  onClick={() => !imageUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
                    imageUploading
                      ? "border-[#ff2b75]/50 bg-pink-50/20 cursor-wait"
                      : "border-gray-300 hover:border-[#ff2b75] hover:bg-pink-50/30"
                  }`}
                >
                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <Loader2 className="w-7 h-7 text-[#ff2b75] animate-spin" />
                      <p className="text-xs font-semibold text-[#ff2b75]">Uploading image...</p>
                      <p className="text-[11px] text-gray-400">Processing file...</p>
                    </div>
                  ) : categoryForm.imageUrl ? (
                    <div className="flex items-center gap-3.5 w-full">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0 shadow-xs">
                        <LazyImage
                          src={categoryForm.imageUrl}
                          alt="Category preview"
                          fill
                          className="object-cover"
                          fallbackText={categoryForm.name || "Preview"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-green-600" /> Image Selected
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {categoryForm.imageUrl.startsWith("data:") ? "Local Image File" : categoryForm.imageUrl}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-[#ff2b75] group-hover:underline">
                          Click to choose a different image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 text-[#ff2b75] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        Upload Image from Computer / Phone
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Click here to select JPG, PNG, WEBP from your local files
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                </div>

                {/* Direct URL paste */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={categoryForm.imageUrl.startsWith("data:") ? "" : categoryForm.imageUrl}
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff2b75] focus:border-[#ff2b75] transition-colors"
                  />
                </div>
              </div>

              {/* Subcategories (only when creating new) */}
              {!editingCategory && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Initial Subcategories (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Booties, Sandals, Sneakers, Socks"
                    value={categoryForm.subcategoriesInput}
                    onChange={(e) => setCategoryForm({ ...categoryForm, subcategoriesInput: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Separate with commas (you can also add more subcategories later).
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-6 py-2.5 bg-[#ff2b75] text-white text-sm font-semibold rounded-xl hover:bg-[#e01d62] transition-colors shadow-md disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {categorySaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
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
