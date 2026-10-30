"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  Printer,
  Mail,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Hash,
  IndianRupee,
  Building2,
  ExternalLink,
} from "lucide-react";
import {
  formatINR,
  formatInvoiceDateTime,
  getInvoiceTaxLabels,
  type InvoiceData,
} from "@/lib/invoices";
import { ADMIN_BASE_PATH } from "@/lib/admin";

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminInvoicesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("orderId") || "";

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        // Auto-open modal if ?orderId= was passed in URL
        const orderIdParam = searchParams.get("orderId");
        if (orderIdParam) {
          const match = data.invoices.find(
            (inv: InvoiceData) => String(inv.orderId) === orderIdParam.trim()
          );
          if (match) {
            setSelectedInvoice(match);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track / Filter by Invoice Number, Order ID, or Customer Name/Phone/Email
  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;

    const cleanOrderId = q.replace(/^#/, "").replace(/^order\s*#?/, "").trim();

    return invoices.filter((inv) => {
      const matchInvoiceNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchOrderId =
        String(inv.orderId) === cleanOrderId ||
        `#${inv.orderId}`.includes(q) ||
        String(inv.orderId).includes(q);
      const matchCustomer =
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerEmail && inv.customerEmail.toLowerCase().includes(q)) ||
        (inv.customerPhone && inv.customerPhone.toLowerCase().includes(q));

      return matchInvoiceNo || matchOrderId || matchCustomer;
    });
  }, [invoices, searchQuery]);

  const totals = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, inv) => {
        acc.taxable += inv.subtotal;
        acc.tax += inv.totalTax;
        acc.grandTotal += inv.grandTotal;
        return acc;
      },
      { taxable: 0, tax: 0, grandTotal: 0 }
    );
  }, [filteredInvoices]);

  const handlePrintInvoice = (orderId: number) => {
    const printWindow = window.open(`/api/invoices?orderId=${orderId}&format=html`, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleResendEmail = async (inv: InvoiceData) => {
    if (!inv.customerEmail) {
      alert("This order does not have a customer email address.");
      return;
    }
    setSendingEmailId(inv.orderId);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: inv.orderId, action: "resend_email" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`GST Invoice ${inv.invoiceNumber} emailed to ${inv.customerEmail}!`);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(data.error || "Could not send invoice email.");
      }
    } catch {
      alert("Failed to send invoice email.");
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#ff2b75]" />
            <span>GST Invoices</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track, view, print, and email official GST Tax Invoices by <strong>Invoice Number</strong> or <strong>Order ID</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href={`${ADMIN_BASE_PATH}/profile`}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-[#ff2b75]" />
            <span>Update Store GST No.</span>
          </Link>
          <button
            type="button"
            onClick={fetchInvoices}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total GST Invoices</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{filteredInvoices.length}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Auto-generated on order approval</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-pink-50 text-[#ff2b75] flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Taxable Value</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹{totals.taxable.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              + ₹{totals.tax.toFixed(2)} Total GST (CGST + SGST)
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Grand Total Billed</p>
            <p className="text-2xl font-black text-[#ff2b75] mt-1">₹{totals.grandTotal.toFixed(2)}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Inclusive of all taxes</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Track by Invoice Number or Order ID Search Box */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Track by Invoice Number (e.g. BB-INV-2026-0001), Order ID (e.g. #1 or 1), Customer Name, Phone or Email..."
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#ff2b75] focus:ring-2 focus:ring-[#ff2b75]/15 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoices List / Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          Loading GST invoices...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-2">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-700 font-bold text-base">
            {searchQuery ? `No invoice matching "${searchQuery}"` : "No GST invoices generated yet"}
          </p>
          <p className="text-gray-400 text-xs max-w-md mx-auto">
            {searchQuery
              ? "Try searching with another Invoice Number (e.g. BB-INV-...) or Order ID."
              : "Invoices are automatically generated and emailed to customers whenever an order is approved."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice Number</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Store GSTIN</th>
                  <th className="py-3.5 px-4 text-right">Taxable</th>
                  <th className="py-3.5 px-4 text-right">GST (CGST+SGST)</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#ff2b75] whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                        Order #{inv.orderId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{inv.customerName}</p>
                      {inv.customerEmail && (
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{inv.customerEmail}</p>
                      )}
                      {inv.customerPhone && (
                        <p className="text-[11px] text-gray-400">{inv.customerPhone}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {inv.storeGstNumber || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                      ₹{inv.subtotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                      ₹{inv.totalTax.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                      ₹{inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#ff2b75] rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="View GST Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintInvoice(inv.orderId)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Print / Save as PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Print</span>
                        </button>
                        {inv.customerEmail && (
                          <button
                            type="button"
                            disabled={sendingEmailId === inv.orderId}
                            onClick={() => handleResendEmail(inv)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                            title={`Email GST Invoice to ${inv.customerEmail}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">
                              {sendingEmailId === inv.orderId ? "Sending..." : "Email"}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST Invoice Preview Modal */}
      {selectedInvoice && (() => {
        const { cgstLabel, sgstLabel, gstLabel } = getInvoiceTaxLabels(selectedInvoice.items);
        const addressParts = (
          selectedInvoice.storeAddress ||
          "Khanna Nagar, House no. 41, Opposite Kaushik Academy, Haridwar, Uttarakhand, 249401"
        ).split(",");
        const storeAddressLine1 = addressParts.slice(0, 2).join(",").trim();
        const storeAddressLine2 = addressParts.slice(2).join(",").trim();

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
              {/* Modal Top Action Bar */}
              <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-white" />
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold">
                      GST Tax Invoice Preview:{" "}
                      <span className="font-mono text-gray-200">{selectedInvoice.invoiceNumber}</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintInvoice(selectedInvoice.orderId)}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <a
                    href={`/api/invoices?orderId=${selectedInvoice.orderId}&format=html`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
                    title="Open printable invoice in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Invoice Content (Exact Reference Image Design) */}
              <div className="p-5 sm:p-7 overflow-y-auto bg-white text-[#111827] space-y-4">
                {/* 1. TOP HEADER BOX */}
                <div className="border-[1.5px] border-[#9ca3af] rounded-[6px] p-5 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Left Column */}
                    <div className="md:col-span-7 md:pr-6 md:border-r-[1.5px] md:border-[#6b7280]">
                      <div className="flex items-center gap-3.5 mb-2.5">
                        {/* Store Logo */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/apple-touch-icon.png"
                          alt={`${selectedInvoice.storeName} Logo`}
                          className="w-14 h-14 rounded-full object-contain shrink-0"
                        />
                        <div>
                          <div className="text-2xl sm:text-[32px] font-extrabold text-[#111827] leading-none tracking-tight">
                            {selectedInvoice.storeName}
                          </div>
                          <div className="text-[10px] sm:text-[10.5px] font-bold text-[#111827] tracking-[3.4px] uppercase mt-1.5">
                            CLOTHING FOR LITTLE ONES
                          </div>
                        </div>
                      </div>

                      <div className="text-[13px] text-[#1f2937] leading-relaxed mt-2">
                        {storeAddressLine1}
                        {storeAddressLine2 ? (
                          <>
                            ,<br />
                            {storeAddressLine2}
                          </>
                        ) : null}
                      </div>

                      <div className="text-[13px] text-[#111827] mt-2.5 flex flex-wrap items-center gap-2">
                        <span>
                          <strong>&#9742;</strong> {selectedInvoice.storePhone || "+91 95200 42719"}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>
                          <strong>&#9993;</strong> {selectedInvoice.storeEmail || "babybloom.bb2024@gmail.com"}
                        </span>
                      </div>

                      <div className="text-[13.5px] text-[#111827] mt-2.5">
                        <strong>GSTIN:</strong>&nbsp;{" "}
                        {selectedInvoice.storeGstNumber || "Unregistered / Not Set in Profile"}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-5 md:pl-1 flex flex-col justify-between">
                      <div className="bg-[#111827] text-white text-center text-lg sm:text-[20px] font-extrabold tracking-[1.2px] py-2.5 px-3.5 rounded-[5px] uppercase mb-3">
                        GST TAX INVOICE
                      </div>

                      <div className="text-[13px] text-[#111827] divide-y divide-gray-200">
                        <div className="py-1.5 grid grid-cols-2">
                          <span className="text-[#1f2937]">Invoice No:</span>
                          <span className="font-extrabold text-[#111827]">{selectedInvoice.invoiceNumber}</span>
                        </div>
                        <div className="py-1.5 grid grid-cols-2">
                          <span className="text-[#1f2937]">Order ID:</span>
                          <span className="text-[#111827]">#{selectedInvoice.orderId}</span>
                        </div>
                        <div className="py-1.5 grid grid-cols-2">
                          <span className="text-[#1f2937]">Invoice Date:</span>
                          <span className="text-[#111827]">{formatInvoiceDateTime(selectedInvoice.createdAt)}</span>
                        </div>
                        <div className="pt-1.5 grid grid-cols-2">
                          <span className="text-[#1f2937]">Payment Method:</span>
                          <span className="text-[#111827] uppercase">{selectedInvoice.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. BILLED & SHIPPED TO + SUPPLY DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6 border-[1.5px] border-[#9ca3af] rounded-[6px] overflow-hidden">
                    <div className="bg-[#efefef] px-4 py-2 border-b border-gray-200 text-[12px] font-extrabold text-[#111827] uppercase tracking-wide">
                      BILLED &amp; SHIPPED TO
                    </div>
                    <div className="p-4 text-[13px] text-[#1f2937] leading-relaxed">
                      <div className="text-[16px] font-extrabold text-[#111827] mb-1">
                        {selectedInvoice.customerName}
                      </div>
                      <div>{selectedInvoice.customerAddress || "N/A"}</div>
                      <div className="mt-2.5 text-[#111827] flex flex-wrap items-center gap-2">
                        <span>
                          <strong>&#9742;</strong> {selectedInvoice.customerPhone || "N/A"}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>
                          <strong>&#9993;</strong> {selectedInvoice.customerEmail || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-6 border-[1.5px] border-[#9ca3af] rounded-[6px] overflow-hidden">
                    <div className="bg-[#efefef] px-4 py-2 border-b border-gray-200 text-[12px] font-extrabold text-[#111827] uppercase tracking-wide">
                      SUPPLY DETAILS
                    </div>
                    <div className="p-4 text-[13px] text-[#111827] space-y-3.5">
                      <div className="grid grid-cols-12 items-center">
                        <span className="col-span-5 font-extrabold">Place of Supply:</span>
                        <span className="col-span-7">India</span>
                      </div>
                      <div className="grid grid-cols-12 items-center">
                        <span className="col-span-5 font-extrabold">Status:</span>
                        <div className="col-span-7">
                          <span className="inline-flex items-center gap-1.5 bg-[#f3f4f6] border-[1.5px] border-[#374151] rounded-[5px] px-3 py-1 text-[12.5px] font-extrabold text-[#111827]">
                            <span className="w-4 h-4 rounded-full bg-[#111827] text-white inline-flex items-center justify-center text-[10px]">
                              &#10004;
                            </span>
                            <span>Approved &amp; Confirmed</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. ITEMS TABLE */}
                <div className="border-[1.5px] border-[#6b7280] rounded-[6px] overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px] text-[#111827]">
                    <thead>
                      <tr className="bg-[#efefef] font-extrabold text-[12.5px]">
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center w-10">#</th>
                        <th className="py-2.5 px-3 border border-[#9ca3af]">Item Description</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">HSN</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">Qty</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">Rate (₹)</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">Taxable Value (₹)</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">CGST</th>
                        <th className="py-2.5 px-2.5 border border-[#9ca3af] text-center">SGST</th>
                        <th className="py-2.5 px-3 border border-[#9ca3af] text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.sno}>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">{item.sno}</td>
                          <td className="py-3 px-3 border border-[#9ca3af]">
                            <div className="font-extrabold text-[#111827]">{item.name}</div>
                            <div className="text-[12px] text-[#4b5563]">Size: {item.ageGroup}</div>
                          </td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">{item.hsnCode}</td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">{item.quantity}</td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">
                            {formatINR(item.unitPrice)}
                          </td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">
                            {formatINR(item.taxableValue)}
                          </td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">
                            <div>{formatINR(item.cgstAmount)}</div>
                            <div className="text-[11.5px] text-[#6b7280]">({item.cgstRate}%)</div>
                          </td>
                          <td className="py-3 px-2.5 border border-[#9ca3af] text-center">
                            <div>{formatINR(item.sgstAmount)}</div>
                            <div className="text-[11.5px] text-[#6b7280]">({item.sgstRate}%)</div>
                          </td>
                          <td className="py-3 px-3 border border-[#9ca3af] text-right font-extrabold text-[14px]">
                            {formatINR(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. AMOUNT IN WORDS & TAX TOTALS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-6 border-[1.5px] border-[#9ca3af] rounded-[6px] overflow-hidden">
                    <div className="bg-[#efefef] px-4 py-2 border-b border-gray-200 text-[12px] font-extrabold text-[#111827] uppercase tracking-wide">
                      AMOUNT IN WORDS
                    </div>
                    <div className="p-4 text-[14px] font-extrabold text-[#111827] leading-relaxed">
                      {selectedInvoice.amountInWords}
                    </div>
                  </div>

                  <div className="md:col-span-6 border-[1.5px] border-[#9ca3af] rounded-[6px] overflow-hidden text-[13px] text-[#111827]">
                    <div className="divide-y divide-gray-200">
                      <div className="px-4 py-2 flex justify-between">
                        <span className="text-[#1f2937]">Total Taxable Value:</span>
                        <span className="font-extrabold">₹{formatINR(selectedInvoice.subtotal)}</span>
                      </div>
                      <div className="px-4 py-2 flex justify-between">
                        <span className="text-[#1f2937]">Add: CGST ({cgstLabel})</span>
                        <span>₹{formatINR(selectedInvoice.cgstAmount)}</span>
                      </div>
                      <div className="px-4 py-2 flex justify-between">
                        <span className="text-[#1f2937]">Add: SGST ({sgstLabel})</span>
                        <span>₹{formatINR(selectedInvoice.sgstAmount)}</span>
                      </div>
                      <div className="px-4 py-2 flex justify-between">
                        <span className="text-[#1f2937]">Total GST ({gstLabel})</span>
                        <span className="font-extrabold">₹{formatINR(selectedInvoice.totalTax)}</span>
                      </div>
                      <div className="px-4 py-3 bg-[#efefef] flex justify-between items-center">
                        <span className="text-[18px] font-extrabold text-[#111827]">Grand Total:</span>
                        <span className="text-[20px] font-extrabold text-[#111827]">
                          ₹{formatINR(selectedInvoice.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. FOOTER */}
                <div className="border-t-[1.5px] border-[#374151] pt-3.5 text-center text-[13px] text-[#111827]">
                  <p className="font-extrabold">Thank you for shopping with {selectedInvoice.storeName}.</p>
                  <p className="text-[#374151] mt-0.5">We appreciate your support!</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">Loading GST Invoices...</div>
      }
    >
      <AdminInvoicesContent />
    </Suspense>
  );
}

