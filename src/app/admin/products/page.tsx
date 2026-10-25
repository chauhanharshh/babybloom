"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, UploadCloud, ImageIcon, Loader2, FolderTree, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LazyImage from "@/components/LazyImage";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  ageGroup: string;
  style?: string;
  description: string | null;
  imageUrl: string | null;
};

type SubcategoryItem = {
  id: number;
  name: string;
  slug: string;
};

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  subcategories: SubcategoryItem[];
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // Quick inline creation states
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickSubOpen, setQuickSubOpen] = useState(false);
  const [quickSubName, setQuickSubName] = useState("");

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Girls",
    ageGroup: "0-1 Yrs",
    style: "Regular",
    description: "",
    imageUrl: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products and categories on mount + auto refresh on tab focus
  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        ageGroup: product.ageGroup,
        style: product.style || "Regular",
        description: product.description || "",
        imageUrl: product.imageUrl || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", category: "Girls", ageGroup: "0-1 Yrs", style: "Regular", description: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setQuickCatOpen(false);
    setQuickSubOpen(false);
  };

  // Quick category creation directly inside modal
  const handleCreateQuickCategory = async () => {
    if (!quickCatName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: quickCatName.trim(), subcategories: ["Regular"] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      setCategories([...categories, data]);
      setFormData({ ...formData, category: data.name, style: "Regular" });
      setQuickCatName("");
      setQuickCatOpen(false);
    } catch (err) {
      openAlert("Category Error", (err as Error).message);
    }
  };

  // Quick subcategory creation directly inside modal
  const handleCreateQuickSubcategory = async () => {
    if (!quickSubName.trim()) return;
    const catObj = categories.find((c) => c.name.toLowerCase() === formData.category.toLowerCase());
    if (!catObj) {
      openAlert("Select Category", "Pehle ek valid category select karein jisme subcategory add karni hai.", "warning");
      return;
    }
    try {
      const res = await fetch(`/api/categories/${catObj.id}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: quickSubName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add subcategory");
      setCategories(
        categories.map((c) =>
          c.id === catObj.id ? { ...c, subcategories: [...c.subcategories, data] } : c
        )
      );
      setFormData({ ...formData, style: data.name });
      setQuickSubName("");
      setQuickSubOpen(false);
    } catch (err) {
      openAlert("Subcategory Error", (err as Error).message);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updated = await res.json();
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Create new product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const created = await res.json();
        setProducts([created, ...products]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save product", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    const targetProduct = products.find((p) => p.id === id);
    const prodName = targetProduct?.name ? `"${targetProduct.name}"` : "this product";

    openConfirm({
      title: "Delete Product?",
      message: `Kya aap sure hain ki aap ${prodName} ko permanently delete karna chahte hain?`,
      confirmText: "Yes, Delete Product",
      type: "danger",
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await fetch(`/api/products/${id}`, { method: "DELETE" });
          setProducts(products.filter((p) => p.id !== id));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          openAlert("Delete Failed", "Failed to delete product: " + (err as Error).message);
        }
      },
    });
  };

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
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Image upload failed", err);
      setImageUploadError("Upload fail hua. Dobara try karo ya URL paste karo.");
    } finally {
      setImageUploading(false);
      // Reset file input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your store inventory.</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchProducts()}
            disabled={loading}
            className="bg-white border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs text-sm"
            title="Refresh Products & Stock"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff2b75] ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/categories"
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs text-sm"
          >
            <FolderTree className="w-4 h-4 text-[#ff2b75]" />
            <span>Categories</span>
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_4px_14px_0_rgb(168,43,84,0.39)] hover:shadow-[0_6px_20px_rgba(168,43,84,0.23)] flex-1 sm:flex-initial"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium text-gray-700 cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            {categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Newborn">Newborn</option>
              </>
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-100 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Age Group</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200 shadow-sm">
                          {product.imageUrl ? (
                            <LazyImage
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              loading="lazy"
                              className="object-cover"
                              fallbackText={product.name}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 line-clamp-1">{product.name}</span>
                          <span className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-[200px]">{product.description || "No description"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{product.category}</td>
                    <td className="py-4 px-6 text-gray-600">{product.ageGroup}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">₹{product.price}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        product.stock > 10 ? "bg-green-50 text-green-700 border-green-200" :
                        product.stock > 0 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the information below to {editingProduct ? "update the" : "create a"} product.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="flex flex-col md:flex-row gap-8">

                {/* Left Column - Image Upload */}
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Product Image</h3>

                    <div
                      className={`border-2 border-dashed rounded-xl bg-gray-50 transition-colors relative aspect-[4/5] flex flex-col items-center justify-center overflow-hidden group ${
                        imageUploading
                          ? "border-primary/50 cursor-wait"
                          : "border-gray-300 hover:bg-gray-100 cursor-pointer"
                      }`}
                      onClick={() => !imageUploading && fileInputRef.current?.click()}
                    >
                      {imageUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <p className="text-sm font-semibold text-primary">Uploading...</p>
                          <p className="text-xs text-gray-400">Cloudinary pe upload ho raha hai</p>
                        </div>
                      ) : formData.imageUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                          <LazyImage src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium flex items-center gap-2">
                              <UploadCloud className="w-5 h-5" /> Change Image
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-primary">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF — Cloudinary pe save hoga</p>
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

                    {imageUploadError && (
                      <p className="mt-2 text-xs text-red-500 font-medium">{imageUploadError}</p>
                    )}

                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Or paste Image URL</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="e.g., Floral Summer Dress"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        placeholder="Write a brief description about the product..."
                      />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Pricing & Inventory</h3>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                          <input
                            required
                            type="number"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="899"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                        <input
                          required
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Organization</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Category Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-semibold text-gray-700">Category</label>
                          <button
                            type="button"
                            onClick={() => setQuickCatOpen(!quickCatOpen)}
                            className="text-xs text-[#ff2b75] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> New
                          </button>
                        </div>

                        {quickCatOpen && (
                          <div className="flex gap-1.5 mb-2">
                            <input
                              type="text"
                              placeholder="New Category..."
                              value={quickCatName}
                              onChange={(e) => setQuickCatName(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={handleCreateQuickCategory}
                              className="px-2.5 py-1 bg-[#ff2b75] text-white text-xs rounded-lg font-medium hover:bg-[#e01d62]"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        <select
                          value={formData.category}
                          onChange={(e) => {
                            const selected = e.target.value;
                            const catObj = categories.find((c) => c.name.toLowerCase() === selected.toLowerCase());
                            const firstSub = catObj?.subcategories?.[0]?.name || "Regular";
                            setFormData({ ...formData, category: selected, style: firstSub });
                          }}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-medium text-gray-700 cursor-pointer text-sm"
                        >
                          {categories.length > 0 ? (
                            categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Girls">Girls</option>
                              <option value="Boys">Boys</option>
                              <option value="Newborn">Newborn</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Subcategory / Style Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                          <button
                            type="button"
                            onClick={() => setQuickSubOpen(!quickSubOpen)}
                            className="text-xs text-[#ff2b75] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> New
                          </button>
                        </div>

                        {quickSubOpen && (
                          <div className="flex gap-1.5 mb-2">
                            <input
                              type="text"
                              placeholder="New Subcategory..."
                              value={quickSubName}
                              onChange={(e) => setQuickSubName(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={handleCreateQuickSubcategory}
                              className="px-2.5 py-1 bg-[#ff2b75] text-white text-xs rounded-lg font-medium hover:bg-[#e01d62]"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        {(() => {
                          const catObj = categories.find(
                            (c) => c.name.toLowerCase() === formData.category.toLowerCase()
                          );
                          const subList = catObj?.subcategories?.length
                            ? Array.from(new Set([formData.style, ...catObj.subcategories.map((s) => s.name)]))
                            : Array.from(new Set([formData.style, "Regular", "Casual", "Party Wear", "Ethnic Wear"]));

                          return (
                            <select
                              value={formData.style}
                              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-medium text-gray-700 cursor-pointer text-sm"
                            >
                              {subList.map((subName) => (
                                <option key={subName} value={subName}>
                                  {subName}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>

                      {/* Age Group */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-semibold text-gray-700">Age Group</label>
                        </div>
                        <select
                          value={formData.ageGroup}
                          onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-medium text-gray-700 cursor-pointer text-sm"
                        >
                          <option value="0-1 Yrs">0-1 Yrs</option>
                          <option value="1-2 Yrs">1-2 Yrs</option>
                          <option value="2-3 Yrs">2-3 Yrs</option>
                          <option value="3-4 Yrs">3-4 Yrs</option>
                          <option value="4-5 Yrs">4-5 Yrs</option>
                          <option value="5-6 Yrs">5-6 Yrs</option>
                          <option value="1-6 Yrs">1-6 Yrs</option>
                          <option value="0-12 Months">0-12 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                onClick={handleSaveProduct}
                disabled={saving}
                className="px-8 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>

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
