"use client";

import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LazyImage from "@/components/LazyImage";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

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

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q);
    const matchesSub = c.subcategories.some((s) => s.name.toLowerCase().includes(q));
    return matchesName || matchesSub;
  });

  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // Open modal for Create or Edit
  const handleOpenCategoryModal = (cat: Category | null = null) => {
    setCategoryError("");
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
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySaving(true);
    setCategoryError("");

    try {
      if (editingCategory) {
        // Update category
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
        showToast(`Category "${data.name}" updated successfully!`);
      } else {
        // Create new category
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
      ? ` Note: Is category mein ${cat.productCount} product(s) hain jo uncategorized ho sakte hain.`
      : "";

    openConfirm({
      title: `Delete Category "${cat.name}"?`,
      message: `Kya aap sure hain ki aap "${cat.name}" category aur iske saare subcategories ko delete karna chahte hain?${countWarning}`,
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

      // Update state
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

      // Clear input
      setSubInputs({ ...subInputs, [categoryId]: "" });
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
      message: `Kya aap sure hain ki aap "${sub.name}" subcategory ko delete karna chahte hain?`,
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#ff2b75]" />
            Categories & Subcategories
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Create new categories, manage subcategories, and structure your babywear inventory.
          </p>
        </div>
        <button
          onClick={() => handleOpenCategoryModal()}
          className="bg-[#ff2b75] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e01d62] transition-colors shadow-[0_4px_14px_0_rgba(255,43,117,0.39)] hover:shadow-[0_6px_20px_rgba(255,43,117,0.23)] w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="mt-4 px-5 py-2.5 bg-[#ff2b75] text-white rounded-xl text-sm font-semibold hover:bg-[#e01d62] transition-colors"
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
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                            className="text-pink-400 hover:text-red-600 p-0.5 rounded transition-colors"
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
                    className="px-3 py-1.5 bg-[#ff2b75] text-white text-xs font-semibold rounded-lg hover:bg-[#e01d62] transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
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

      {/* Add / Edit Category Modal */}
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
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
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

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... or /images/categories/..."
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff2b75]/20 focus:border-[#ff2b75] transition-colors"
                />
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
                    Comma se separate karke likhein (aap baad mein bhi naye subcategories add kar sakte hain).
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-6 py-2.5 bg-[#ff2b75] text-white text-sm font-semibold rounded-xl hover:bg-[#e01d62] transition-colors shadow-md disabled:opacity-60 flex items-center gap-2"
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
