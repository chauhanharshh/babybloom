"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BadgePercent,
  LogOut,
  Menu,
  X,
  FolderTree,
  Store,
  FileText,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ADMIN_BASE_PATH } from "@/lib/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Backend Session Auth State (No password ever stored in frontend)
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [username] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setAuthStatus(data?.authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setAuthStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!password.trim()) {
      setLoginError("Please enter your admin password.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPassword("");
        setAuthStatus("authenticated");
      } else {
        setLoginError(data.error || "Invalid password. Please try again.");
      }
    } catch {
      setLoginError("Failed to connect to server. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    setAuthStatus("unauthenticated");
    setPassword("");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (!currentPassword || !newPassword) {
      setPwdMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    setIsUpdatingPwd(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPwdMessage({ type: "success", text: "Password updated in database successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdMessage({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch {
      setPwdMessage({ type: "error", text: "Server error while updating password." });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  // 1. Loading State while checking HttpOnly session cookie
  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#ff2b75] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">Verifying Admin Session...</p>
      </div>
    );
  }

  // 2. Unauthenticated -> Render Secure Backend-Verified Login Gate
  if (authStatus !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/70 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-pink-100 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-pink-100 shadow-sm mb-3">
              <Image
                src="/icons/apple-touch-icon.png"
                alt="BabyBloom Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">BabyBloom Admin</h1>
            <p className="text-xs text-gray-500 mt-1">
              Protected Admin Portal • Enter your credentials to continue
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 font-semibold text-sm cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  Fixed
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#ff2b75] focus:ring-2 focus:ring-pink-100 outline-none text-sm font-medium text-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#ff2b75] hover:bg-[#e01d62] text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-pink-500/20 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? "Verifying..." : "Unlock Admin Panel"}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-[#ff2b75] transition-colors"
            >
              &larr; Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated -> Render Full Admin Dashboard
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 w-full fixed top-0 z-20">
        <Link href={ADMIN_BASE_PATH} className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs shrink-0">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="Babybloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <span>BabyBloom</span>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 border-b border-gray-200 hidden md:flex">
          <Link href={ADMIN_BASE_PATH} className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-pink-100 shadow-2xs shrink-0">
              <Image
                src="/icons/apple-touch-icon.png"
                alt="Babybloom Logo"
                fill
                className="object-contain"
              />
            </div>
            <span>BabyBloom</span>
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={ADMIN_BASE_PATH}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/products`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/categories`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <FolderTree className="w-5 h-5" />
            <span className="font-medium">Categories</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/offers-banners`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <BadgePercent className="w-5 h-5" />
            <span className="font-medium">Offers & Banners</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/orders`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/invoices`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">GST Invoices</span>
          </Link>
          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            href={`${ADMIN_BASE_PATH}/profile`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">Store Profile & Payments</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setPwdMessage(null);
              setIsPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-gray-500" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock & Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* Change Admin Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#ff2b75]" />
                <h2 className="text-lg font-extrabold text-gray-900">Change Admin Password</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  pwdMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {pwdMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#ff2b75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#ff2b75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#ff2b75] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#ff2b75] hover:bg-[#e01d62] transition-colors disabled:opacity-60"
                >
                  {isUpdatingPwd ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
