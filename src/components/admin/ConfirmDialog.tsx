"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, Info, X, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  isAlertOnly?: boolean; // If true, only shows 1 action button (like a themed alert)
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  isAlertOnly = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: "bg-pink-50 border border-pink-200 text-[#ff2b75]",
      btn: "bg-[#ff2b75] hover:bg-[#e01d62] text-white shadow-[0_4px_14px_0_rgba(255,43,117,0.35)]",
      icon: Trash2,
    },
    warning: {
      bg: "bg-amber-50 border border-amber-200 text-amber-600",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-blue-50 border border-blue-200 text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
      icon: Info,
    },
  }[type];

  const IconComponent = iconConfig.icon;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay click to dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={() => !isLoading && onCancel()} 
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-pink-100/60 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Themed Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
              <IconComponent className="w-6 h-6" />
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
          {!isAlertOnly && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-white hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-60 ${iconConfig.btn}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isAlertOnly ? "OK" : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
