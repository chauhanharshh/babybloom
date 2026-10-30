import prisma from "./prisma";
import { getStoreProfile } from "./profile";

export interface InvoiceLineItem {
  sno: number;
  name: string;
  ageGroup: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  gstRate: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
}

export interface InvoiceData {
  id: number;
  invoiceNumber: string;
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  storeName: string;
  storeGstNumber: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
  items: InvoiceLineItem[];
  createdAt: string | Date;
}

let invoiceTableEnsured = false;

export async function ensureInvoiceTable() {
  if (invoiceTableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Invoice" (
        "id" SERIAL PRIMARY KEY,
        "invoiceNumber" TEXT NOT NULL UNIQUE,
        "orderId" INTEGER NOT NULL UNIQUE,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT DEFAULT '',
        "customerPhone" TEXT DEFAULT '',
        "customerAddress" TEXT DEFAULT '',
        "paymentMethod" TEXT DEFAULT 'COD',
        "storeName" TEXT NOT NULL DEFAULT 'Baby Bloom',
        "storeGstNumber" TEXT DEFAULT '',
        "storeAddress" TEXT DEFAULT '',
        "storePhone" TEXT DEFAULT '',
        "storeEmail" TEXT DEFAULT '',
        "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "cgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "sgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "itemsJson" TEXT NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    invoiceTableEnsured = true;
  } catch (err) {
    console.warn("Notice: Could not ensure Invoice table:", err);
  }
}

export function formatInvoiceNumber(orderId: number, date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  return `BB-INV-${year}-${String(orderId).padStart(4, "0")}`;
}

export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const convertBelowThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertBelowThousand(n % 100) : "")
    );
  };

  let n = rounded;
  const parts: string[] = [];

  if (n >= 10000000) {
    parts.push(convertBelowThousand(Math.floor(n / 10000000)) + " Crore");
    n %= 10000000;
  }
  if (n >= 100000) {
    parts.push(convertBelowThousand(Math.floor(n / 100000)) + " Lakh");
    n %= 100000;
  }
  if (n >= 1000) {
    parts.push(convertBelowThousand(Math.floor(n / 1000)) + " Thousand");
    n %= 1000;
  }
  if (n > 0) {
    parts.push(convertBelowThousand(n));
  }

  return `INR ${parts.join(" ")} Rupees Only`;
}

export function calculateInvoiceItems(
  rawItems: { name: string; price: number; quantity: number; ageGroup?: string }[]
): {
  items: InvoiceLineItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let grandTotal = 0;

  const items: InvoiceLineItem[] = rawItems.map((item, idx) => {
    const lineTotal = Number((item.price * item.quantity).toFixed(2));
    // Indian GST on readymade garments (HSN 6111 / 6209): 5% up to ₹1000/pc, 12% above ₹1000/pc
    const gstRate = item.price <= 1000 ? 5 : 12;
    const taxableValue = Number((lineTotal / (1 + gstRate / 100)).toFixed(2));
    const lineTax = Number((lineTotal - taxableValue).toFixed(2));
    const cgst = Number((lineTax / 2).toFixed(2));
    const sgst = Number((lineTax - cgst).toFixed(2));

    subtotal += taxableValue;
    cgstAmount += cgst;
    sgstAmount += sgst;
    grandTotal += lineTotal;

    return {
      sno: idx + 1,
      name: item.name,
      ageGroup: item.ageGroup || "Standard",
      hsnCode: "6111",
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal,
      gstRate,
      taxableValue,
      cgstRate: gstRate / 2,
      cgstAmount: cgst,
      sgstRate: gstRate / 2,
      sgstAmount: sgst,
    };
  });

  subtotal = Number(subtotal.toFixed(2));
  cgstAmount = Number(cgstAmount.toFixed(2));
  sgstAmount = Number(sgstAmount.toFixed(2));
  const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));
  grandTotal = Number(grandTotal.toFixed(2));

  return { items, subtotal, cgstAmount, sgstAmount, totalTax, grandTotal };
}

function mapDbRecordToInvoiceData(record: {
  id: number;
  invoiceNumber: string;
  orderId: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  paymentMethod: string | null;
  storeName: string;
  storeGstNumber: string | null;
  storeAddress: string | null;
  storePhone: string | null;
  storeEmail: string | null;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
  grandTotal: number;
  itemsJson: string;
  createdAt: Date | string;
}): InvoiceData {
  let parsedItems: InvoiceLineItem[] = [];
  try {
    parsedItems = JSON.parse(record.itemsJson || "[]");
  } catch {
    parsedItems = [];
  }

  return {
    id: record.id,
    invoiceNumber: record.invoiceNumber,
    orderId: record.orderId,
    customerName: record.customerName,
    customerEmail: record.customerEmail || "",
    customerPhone: record.customerPhone || "",
    customerAddress: record.customerAddress || "",
    paymentMethod: record.paymentMethod || "COD",
    storeName: record.storeName || "Baby Bloom",
    storeGstNumber: record.storeGstNumber || "",
    storeAddress: record.storeAddress || "",
    storePhone: record.storePhone || "",
    storeEmail: record.storeEmail || "",
    subtotal: record.subtotal,
    cgstAmount: record.cgstAmount,
    sgstAmount: record.sgstAmount,
    totalTax: record.totalTax,
    grandTotal: record.grandTotal,
    amountInWords: numberToWordsINR(record.grandTotal),
    items: parsedItems,
    createdAt: record.createdAt,
  };
}

export async function createOrGetInvoiceForOrder(orderId: number): Promise<InvoiceData | null> {
  await ensureInvoiceTable();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return null;

  const storeProfile = await getStoreProfile();

  let parsedCustomer = {
    name: order.customerName || "Customer",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
  };

  try {
    if (order.customerName && order.customerName.startsWith("{")) {
      const json = JSON.parse(order.customerName);
      parsedCustomer = {
        name: json.name || "Customer",
        email: json.email || "",
        phone: json.phone || "",
        address: json.address || "",
        paymentMethod: json.paymentMethod || "COD",
      };
    }
  } catch {
    // Fallback
  }

  const calc = calculateInvoiceItems(
    order.items.map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      ageGroup: i.ageGroup,
    }))
  );

  const invoiceNumber = formatInvoiceNumber(order.id, order.createdAt);
  const storeAddress = [
    storeProfile.addressLine1,
    storeProfile.addressLine2,
    storeProfile.city,
    storeProfile.state,
    storeProfile.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const record = await prisma.invoice.upsert({
    where: { orderId: order.id },
    update: {
      customerName: parsedCustomer.name,
      customerEmail: parsedCustomer.email,
      customerPhone: parsedCustomer.phone,
      customerAddress: parsedCustomer.address,
      paymentMethod: parsedCustomer.paymentMethod,
      storeName: storeProfile.storeName,
      storeGstNumber: storeProfile.gstNumber || "",
      storeAddress,
      storePhone: storeProfile.phone,
      storeEmail: storeProfile.email,
      subtotal: calc.subtotal,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      totalTax: calc.totalTax,
      grandTotal: calc.grandTotal,
      itemsJson: JSON.stringify(calc.items),
    },
    create: {
      invoiceNumber,
      orderId: order.id,
      customerName: parsedCustomer.name,
      customerEmail: parsedCustomer.email,
      customerPhone: parsedCustomer.phone,
      customerAddress: parsedCustomer.address,
      paymentMethod: parsedCustomer.paymentMethod,
      storeName: storeProfile.storeName,
      storeGstNumber: storeProfile.gstNumber || "",
      storeAddress,
      storePhone: storeProfile.phone,
      storeEmail: storeProfile.email,
      subtotal: calc.subtotal,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      totalTax: calc.totalTax,
      grandTotal: calc.grandTotal,
      itemsJson: JSON.stringify(calc.items),
    },
  });

  return mapDbRecordToInvoiceData(record);
}

export async function getAllInvoices(): Promise<InvoiceData[]> {
  await ensureInvoiceTable();

  // Sync any approved orders that don't have an invoice yet
  try {
    const approvedOrders = await prisma.order.findMany({
      where: { status: "approved" },
      select: { id: true },
    });
    const existingInvoices = await prisma.invoice.findMany({
      select: { orderId: true },
    });
    const existingOrderIds = new Set(existingInvoices.map((i) => i.orderId));

    for (const ord of approvedOrders) {
      if (!existingOrderIds.has(ord.id)) {
        await createOrGetInvoiceForOrder(ord.id);
      }
    }
  } catch (err) {
    console.warn("Notice: Could not auto-sync approved orders to invoices:", err);
  }

  const records = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapDbRecordToInvoiceData);
}

export function formatINR(value: number): string {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInvoiceDateTime(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${datePart}, ${timePart}`;
}

export function getInvoiceTaxLabels(items: InvoiceLineItem[]): {
  cgstLabel: string;
  sgstLabel: string;
  gstLabel: string;
} {
  const uniqueRates = Array.from(new Set(items.map((i) => i.gstRate)));
  if (uniqueRates.length === 1) {
    const r = uniqueRates[0];
    return {
      cgstLabel: `${r / 2}%`,
      sgstLabel: `${r / 2}%`,
      gstLabel: `${r}%`,
    };
  }
  return {
    cgstLabel: "2.5% / 6%",
    sgstLabel: "2.5% / 6%",
    gstLabel: "5% / 12%",
  };
}

let cachedLogoDataUri: string | null = null;

export function getStoreLogoSrc(): string {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs") as typeof import("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path") as typeof import("path");
      const logoPath = path.join(process.cwd(), "public", "icons", "apple-touch-icon.png");
      if (fs.existsSync(logoPath)) {
        const base64 = fs.readFileSync(logoPath).toString("base64");
        cachedLogoDataUri = `data:image/png;base64,${base64}`;
        return cachedLogoDataUri;
      }
    } catch {
      // Fallback to public URL
    }
  }
  return "/icons/apple-touch-icon.png";
}

export function escapeHtml(str?: string | number | null): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateGstInvoiceHtml(invoice: InvoiceData): string {
  const formattedDate = formatInvoiceDateTime(invoice.createdAt);
  const { cgstLabel, sgstLabel, gstLabel } = getInvoiceTaxLabels(invoice.items);
  const logoSrc = getStoreLogoSrc();

  const addressParts = (invoice.storeAddress || "Khanna Nagar, House no. 41, Opposite Kaushik Academy, Haridwar, Uttarakhand, 249401").split(",");
  const storeAddressLine1 = escapeHtml(addressParts.slice(0, 2).join(",").trim());
  const storeAddressLine2 = escapeHtml(addressParts.slice(2).join(",").trim());

  const rowsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">${item.sno}</td>
        <td style="padding: 12px 12px; border: 1px solid #9ca3af; font-size: 13px; color: #111827;">
          <strong style="font-size: 13.5px; color: #111827;">${escapeHtml(item.name)}</strong><br/>
          <span style="color: #4b5563; font-size: 12px;">Size: ${escapeHtml(item.ageGroup)}</span>
        </td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">${item.hsnCode}</td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">${item.quantity}</td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">${formatINR(item.unitPrice)}</td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">${formatINR(item.taxableValue)}</td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">
          ${formatINR(item.cgstAmount)}<br/>
          <span style="font-size: 11.5px; color: #6b7280;">(${item.cgstRate}%)</span>
        </td>
        <td style="padding: 12px 10px; border: 1px solid #9ca3af; text-align: center; font-size: 13px; color: #111827;">
          ${formatINR(item.sgstAmount)}<br/>
          <span style="font-size: 11.5px; color: #6b7280;">(${item.sgstRate}%)</span>
        </td>
        <td style="padding: 12px 12px; border: 1px solid #9ca3af; text-align: right; font-size: 14px; font-weight: 800; color: #111827;">${formatINR(item.lineTotal)}</td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GST Tax Invoice - ${invoice.invoiceNumber}</title>
  <style>
    @media print {
      body { padding: 0 !important; margin: 0 !important; }
      .invoice-wrapper { border: none !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 20px; background: #ffffff;">
  <div class="invoice-wrapper" style="max-width: 880px; margin: 0 auto; background: #ffffff;">

    <!-- 1. TOP HEADER BOX -->
    <div style="border: 1.5px solid #9ca3af; border-radius: 6px; padding: 20px 24px; margin-bottom: 16px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Left: Brand + Address + Contact + GSTIN -->
          <td style="width: 57%; vertical-align: top; padding-right: 22px; border-right: 1.5px solid #6b7280;">
            <table style="border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="vertical-align: middle; padding-right: 14px;">
                  <img
                    src="${logoSrc}"
                    alt="${invoice.storeName} Logo"
                    style="width: 56px; height: 56px; border-radius: 50%; object-fit: contain; display: block;"
                  />
                </td>
                <td style="vertical-align: middle;">
                  <div style="font-size: 32px; font-weight: 800; color: #111827; line-height: 1.05; letter-spacing: -0.5px;">
                    ${invoice.storeName}
                  </div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #111827; letter-spacing: 3.5px; text-transform: uppercase; margin-top: 4px;">
                    CLOTHING FOR LITTLE ONES
                  </div>
                </td>
              </tr>
            </table>

            <div style="font-size: 13px; color: #1f2937; line-height: 1.5; margin-top: 8px;">
              ${storeAddressLine1}${storeAddressLine2 ? `, <br/>${storeAddressLine2}` : ""}
            </div>

            <div style="font-size: 13px; color: #111827; margin-top: 10px;">
              <strong>&#9742;</strong> ${invoice.storePhone || "+91 95200 42719"}
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>&#9993;</strong> ${invoice.storeEmail || "babybloom.bb2024@gmail.com"}
            </div>

            <div style="font-size: 13.5px; color: #111827; margin-top: 10px;">
              <strong>GSTIN:</strong>&nbsp; ${invoice.storeGstNumber || "Unregistered / Not Set in Profile"}
            </div>
          </td>

          <!-- Right: GST TAX INVOICE Banner + Metadata Rows -->
          <td style="width: 43%; vertical-align: top; padding-left: 22px;">
            <div style="background: #111827; color: #ffffff; text-align: center; font-size: 20px; font-weight: 800; letter-spacing: 1.2px; padding: 10px 14px; border-radius: 5px; text-transform: uppercase; margin-bottom: 12px;">
              GST TAX INVOICE
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #111827;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px 0; color: #1f2937;">Invoice No:</td>
                <td style="padding: 6px 0; font-weight: 800; color: #111827;">${invoice.invoiceNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px 0; color: #1f2937;">Order ID:</td>
                <td style="padding: 6px 0; color: #111827;">#${invoice.orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px 0; color: #1f2937;">Invoice Date:</td>
                <td style="padding: 6px 0; color: #111827;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0 0; color: #1f2937;">Payment Method:</td>
                <td style="padding: 6px 0 0; color: #111827; text-transform: uppercase;">${invoice.paymentMethod}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- 2. BILLED & SHIPPED TO + SUPPLY DETAILS -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 16px;">
      <tr>
        <td style="width: 53%; vertical-align: top; padding-right: 8px;">
          <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden; min-height: 138px;">
            <div style="background: #efefef; padding: 8px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
              BILLED &amp; SHIPPED TO
            </div>
            <div style="padding: 12px 16px; font-size: 13px; color: #1f2937; line-height: 1.5;">
              <div style="font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 4px;">
                ${escapeHtml(invoice.customerName)}
              </div>
              <div>${escapeHtml(invoice.customerAddress || "N/A")}</div>
              <div style="margin-top: 8px; color: #111827;">
                <strong>&#9742;</strong> ${escapeHtml(invoice.customerPhone || "N/A")}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <strong>&#9993;</strong> ${escapeHtml(invoice.customerEmail || "N/A")}
              </div>
            </div>
          </div>
        </td>

        <td style="width: 47%; vertical-align: top; padding-left: 8px;">
          <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden; min-height: 138px;">
            <div style="background: #efefef; padding: 8px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
              SUPPLY DETAILS
            </div>
            <div style="padding: 14px 16px; font-size: 13px; color: #111827;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0 14px; font-weight: 800; width: 42%;">Place of Supply:</td>
                  <td style="padding: 4px 0 14px;">India</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 800; vertical-align: middle;">Status:</td>
                  <td style="padding: 4px 0; vertical-align: middle;">
                    <span style="display: inline-block; background: #f3f4f6; border: 1.5px solid #374151; border-radius: 5px; padding: 5px 12px; font-size: 12.5px; font-weight: 800; color: #111827;">
                      &#10004; Approved &amp; Confirmed
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- 3. ITEMS TABLE -->
    <div style="border: 1.5px solid #6b7280; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #efefef; color: #111827; font-size: 12.5px; font-weight: 800;">
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 40px;">#</th>
            <th style="padding: 10px 12px; border: 1px solid #9ca3af; text-align: left;">Item Description</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 65px;">HSN</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 50px;">Qty</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 90px;">Rate (₹)</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 125px;">Taxable Value (₹)</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 75px;">CGST</th>
            <th style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: center; width: 75px;">SGST</th>
            <th style="padding: 10px 12px; border: 1px solid #9ca3af; text-align: right; width: 95px;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <!-- 4. AMOUNT IN WORDS & TAX TOTALS -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 22px;">
      <tr>
        <td style="width: 51%; vertical-align: top; padding-right: 8px;">
          <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden;">
            <div style="background: #efefef; padding: 8px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
              AMOUNT IN WORDS
            </div>
            <div style="padding: 16px; font-size: 14px; font-weight: 800; color: #111827; line-height: 1.5;">
              ${invoice.amountInWords}
            </div>
          </div>
        </td>

        <td style="width: 49%; vertical-align: top; padding-left: 8px;">
          <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #111827;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 16px; color: #1f2937;">Total Taxable Value:</td>
                <td style="padding: 8px 16px; text-align: right; font-weight: 800;">₹${formatINR(invoice.subtotal)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 16px; color: #1f2937;">Add: CGST (${cgstLabel})</td>
                <td style="padding: 8px 16px; text-align: right;">₹${formatINR(invoice.cgstAmount)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 16px; color: #1f2937;">Add: SGST (${sgstLabel})</td>
                <td style="padding: 8px 16px; text-align: right;">₹${formatINR(invoice.sgstAmount)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <td style="padding: 8px 16px; color: #1f2937;">Total GST (${gstLabel})</td>
                <td style="padding: 8px 16px; text-align: right; font-weight: 800;">₹${formatINR(invoice.totalTax)}</td>
              </tr>
              <tr style="background: #efefef;">
                <td style="padding: 12px 16px; font-size: 18px; font-weight: 800; color: #111827;">Grand Total:</td>
                <td style="padding: 12px 16px; text-align: right; font-size: 20px; font-weight: 800; color: #111827;">₹${formatINR(invoice.grandTotal)}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- 5. FOOTER -->
    <div style="border-top: 1.5px solid #374151; padding-top: 14px; text-align: center; font-size: 13px; color: #111827; line-height: 1.6;">
      <strong>Thank you for shopping with ${invoice.storeName}.</strong><br/>
      <span style="color: #374151;">We appreciate your support!</span>
    </div>

  </div>
</body>
</html>`;
}

