import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { ADMIN_BASE_PATH } from "./admin";
import {
  calculateInvoiceItems,
  formatINR,
  formatInvoiceDateTime,
  formatInvoiceNumber,
  generateGstInvoiceHtml,
  getInvoiceTaxLabels,
  numberToWordsINR,
  type InvoiceData,
} from "./invoices";

export interface OrderItemEmailData {
  name: string;
  price: number;
  quantity: number;
  ageGroup?: string;
}

export interface SendOrderEmailPayload {
  orderId: number;
  customerName: string;
  customerEmail?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  total: number;
  items: OrderItemEmailData[];
  baseUrl?: string;
}

const OWNER_EMAIL = "babybloom.bb2024@gmail.com";

export async function sendOrderNotificationEmail(payload: SendOrderEmailPayload) {
  const {
    orderId,
    customerName,
    customerEmail = "Not provided",
    phone = "Not provided",
    address = "Not provided",
    paymentMethod = "Cash on Delivery (COD)",
    total,
    items,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  } = payload;

  const approveUrl = `${baseUrl}${ADMIN_BASE_PATH}/orders/approve?id=${orderId}`;
  const adminOrdersUrl = `${baseUrl}${ADMIN_BASE_PATH}/orders`;

  const itemsRowsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 12px 8px; font-weight: 600; color: #1f2937; font-size: 14px;">
          ${item.name}
          ${item.ageGroup ? `<br/><span style="font-size: 12px; color: #6b7280; font-weight: normal;">Size: ${item.ageGroup}</span>` : ""}
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #4b5563; font-size: 14px;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #1f2937; font-size: 14px; font-weight: 600;">
          ₹${item.price}
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #ff2b75; font-size: 14px; font-weight: bold;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order #${orderId}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f3f4f6;">
      
      <!-- Top Brand Header -->
      <div style="background: linear-gradient(135deg, #ff2b75 0%, #ff528f 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">🌸 Babybloom</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95; font-weight: 500;">New Customer Order Notification</p>
      </div>

      <!-- Main Notification Banner -->
      <div style="padding: 24px; text-align: center; background-color: #fff0f5; border-bottom: 1px solid #ffd6e4;">
        <span style="background-color: #ff2b75; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
          New Order #${orderId}
        </span>
        <h2 style="margin: 12px 0 6px; font-size: 22px; color: #111827; font-weight: 800;">
          You received an order for ₹${total}!
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Placed by <strong>${customerName}</strong> via Website Checkout
        </p>
      </div>

      <!-- Quick Action Buttons: Accept Order -->
      <div style="padding: 24px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
        <p style="margin: 0 0 16px; font-size: 14px; color: #374151; font-weight: 600;">
          Quick Action: Click below to accept and approve this order directly:
        </p>
        
        <div style="margin-bottom: 12px;">
          <a href="${approveUrl}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
            ✅ Accept / Approve Order #${orderId}
          </a>
        </div>

        <div>
          <a href="${adminOrdersUrl}" style="color: #ff2b75; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block;">
            Open in Admin Orders Panel &rarr;
          </a>
        </div>
      </div>

      <!-- Customer Details Section -->
      <div style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
          👤 Customer & Delivery Details
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
          <tr>
            <td style="padding: 6px 0; width: 120px; color: #6b7280; font-weight: 600;">Customer:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #111827;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Email:</td>
            <td style="padding: 6px 0;">
              <a href="mailto:${customerEmail}" style="color: #ff2b75; text-decoration: none; font-weight: 600;">${customerEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Phone:</td>
            <td style="padding: 6px 0; font-weight: 600;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-weight: 600; vertical-align: top;">Address:</td>
            <td style="padding: 6px 0; line-height: 1.5;">${address}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #10b981;">${paymentMethod.toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <!-- Items Details Table -->
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
          📦 Ordered Items
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 700;">Item</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 700;">Qty</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 700;">Price</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 700;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <!-- Order Total Row -->
        <div style="background-color: #f9fafb; padding: 14px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e5e7eb;">
          <span style="font-size: 14px; font-weight: 700; color: #374151;">Total Amount:</span>
          <span style="font-size: 20px; font-weight: 800; color: #ff2b75; float: right;">₹${total}</span>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
        <p style="margin: 0 0 4px;">Babybloom Kids Fashion Store · Haridwar, Uttarakhand</p>
        <p style="margin: 0;">This is an automated notification sent to babybloom.bb2024@gmail.com.</p>
      </div>

    </div>
  </body>
  </html>
  `;

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || OWNER_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Babybloom Store" <${smtpUser}>`,
        to: OWNER_EMAIL,
        subject: `🌸 New Order #${orderId} Received - ₹${total} from ${customerName}`,
        html: emailHtml,
      });

      console.log(`[Email Sent] Successfully delivered order notification to ${OWNER_EMAIL}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Error] Failed to send email via SMTP to ${OWNER_EMAIL}:`, err);
      return { success: false, error: err };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[EMAIL NOTIFICATION - ORDER #${orderId}]`);
    console.log(`To: ${OWNER_EMAIL}`);
    console.log(`Customer: ${customerName} (${customerEmail}) - Phone: ${phone}`);
    console.log(`Total: ₹${total} | Payment: ${paymentMethod}`);
    console.log(`Accept / Approve Link: ${approveUrl}`);
    console.log(`Notice: To enable actual Gmail sending, add SMTP_PASS or GMAIL_APP_PASSWORD in your .env file.`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }
}

export interface SendOrderApprovedCustomerPayload {
  orderId: number;
  invoiceNumber?: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  total: number;
  items: OrderItemEmailData[];
  gstNumber?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  whatsappNumber?: string;
  baseUrl?: string;
  invoice?: InvoiceData | null;
}

export async function sendOrderApprovedEmailToCustomer(payload: SendOrderApprovedCustomerPayload) {
  const {
    orderId,
    customerName,
    customerEmail,
    phone = "Not provided",
    address = "Not provided",
    paymentMethod = "Cash on Delivery (COD)",
    total,
    items,
    gstNumber = "",
    storeName = "BabyBloom",
    storeAddress = "Khanna Nagar, House no. 41, Haridwar, Uttarakhand - 249401",
    storePhone = "+91 95200 42719",
    storeEmail = OWNER_EMAIL,
    whatsappNumber = "919520042719",
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://babybloom.in",
    invoice,
  } = payload;

  const trimmedEmail = customerEmail?.trim();
  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    console.warn(`[Customer Approval Email Skipped] Order #${orderId} has no valid customer email.`);
    return { success: false, reason: "no_customer_email" };
  }

  const calc = calculateInvoiceItems(items);
  const invNumber = invoice?.invoiceNumber || payload.invoiceNumber || formatInvoiceNumber(orderId);
  const invoiceObj: InvoiceData = invoice || {
    id: orderId,
    invoiceNumber: invNumber,
    orderId,
    customerName,
    customerEmail: trimmedEmail,
    customerPhone: phone,
    customerAddress: address,
    paymentMethod,
    storeName,
    storeGstNumber: gstNumber,
    storeAddress,
    storePhone,
    storeEmail,
    subtotal: calc.subtotal,
    cgstAmount: calc.cgstAmount,
    sgstAmount: calc.sgstAmount,
    totalTax: calc.totalTax,
    grandTotal: calc.grandTotal || total,
    amountInWords: numberToWordsINR(calc.grandTotal || total),
    items: calc.items,
    createdAt: new Date(),
  };

  const formattedInvoiceDate = formatInvoiceDateTime(invoiceObj.createdAt);
  const { cgstLabel, sgstLabel, gstLabel } = getInvoiceTaxLabels(invoiceObj.items);

  const addressParts = (
    invoiceObj.storeAddress ||
    "Khanna Nagar, House no. 41, Opposite Kaushik Academy, Haridwar, Uttarakhand, 249401"
  ).split(",");
  const storeAddressLine1 = addressParts.slice(0, 2).join(",").trim();
  const storeAddressLine2 = addressParts.slice(2).join(",").trim();

  const itemsRowsHtml = invoiceObj.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">${item.sno}</td>
        <td style="padding: 10px 8px; border: 1px solid #9ca3af; font-size: 12px; color: #111827;">
          <strong style="font-size: 12.5px; color: #111827;">${item.name}</strong><br/>
          <span style="font-size: 11px; color: #4b5563;">Size: ${item.ageGroup}</span>
        </td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">${item.hsnCode}</td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">${item.quantity}</td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">${formatINR(item.unitPrice)}</td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">${formatINR(item.taxableValue)}</td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">
          ${formatINR(item.cgstAmount)}<br/>
          <span style="font-size: 10.5px; color: #6b7280;">(${item.cgstRate}%)</span>
        </td>
        <td style="padding: 10px 6px; border: 1px solid #9ca3af; text-align: center; font-size: 12px; color: #111827;">
          ${formatINR(item.sgstAmount)}<br/>
          <span style="font-size: 10.5px; color: #6b7280;">(${item.sgstRate}%)</span>
        </td>
        <td style="padding: 10px 8px; border: 1px solid #9ca3af; text-align: right; font-size: 12.5px; font-weight: 800; color: #111827;">${formatINR(item.lineTotal)}</td>
      </tr>
    `
    )
    .join("");

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi ${storeName}, I have a query regarding my approved Order #${orderId} (Invoice: ${invNumber}).`
  )}`;

  const standaloneInvoiceHtml = generateGstInvoiceHtml(invoiceObj);

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order #${orderId} Approved & GST Tax Invoice ${invNumber}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 820px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">

      <!-- Approval Greeting Banner -->
      <div style="padding: 18px 24px; text-align: center; background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0;">
        <h2 style="margin: 0 0 4px; font-size: 18px; color: #065f46; font-weight: 800;">
          Hi ${customerName}, Aapka Order #${orderId} Approve Ho Gaya Hai! 🎉
        </h2>
        <p style="margin: 0; color: #047857; font-size: 12.5px;">
          Please find your official <strong>GST Tax Invoice (${invNumber})</strong> below and attached with this email.
        </p>
      </div>

      <!-- OFFICIAL GST TAX INVOICE (EXACT DESIGN) -->
      <div style="padding: 20px 22px; background: #ffffff; color: #111827;">

        <!-- 1. TOP HEADER BOX -->
        <div style="border: 1.5px solid #9ca3af; border-radius: 6px; padding: 18px 20px; margin-bottom: 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <!-- Left: Brand + Address + Contact + GSTIN -->
              <td style="width: 56%; vertical-align: top; padding-right: 18px; border-right: 1.5px solid #6b7280;">
                <table style="border-collapse: collapse; margin-bottom: 8px;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px;">
                      <img
                        src="cid:babybloom-logo"
                        alt="${invoiceObj.storeName} Logo"
                        style="width: 50px; height: 50px; border-radius: 50%; object-fit: contain; display: block;"
                      />
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 28px; font-weight: 800; color: #111827; line-height: 1.05; letter-spacing: -0.5px;">
                        ${invoiceObj.storeName}
                      </div>
                      <div style="font-size: 9.5px; font-weight: 700; color: #111827; letter-spacing: 3px; text-transform: uppercase; margin-top: 3px;">
                        CLOTHING FOR LITTLE ONES
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="font-size: 12.5px; color: #1f2937; line-height: 1.45; margin-top: 6px;">
                  ${storeAddressLine1}${storeAddressLine2 ? `, <br/>${storeAddressLine2}` : ""}
                </div>

                <div style="font-size: 12.5px; color: #111827; margin-top: 8px;">
                  <strong>&#9742;</strong> ${invoiceObj.storePhone || "+91 95200 42719"}
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  <strong>&#9993;</strong> ${invoiceObj.storeEmail || OWNER_EMAIL}
                </div>

                <div style="font-size: 13px; color: #111827; margin-top: 8px;">
                  <strong>GSTIN:</strong>&nbsp; ${invoiceObj.storeGstNumber || "Unregistered / Not Set in Profile"}
                </div>
              </td>

              <!-- Right: GST TAX INVOICE Banner + Metadata -->
              <td style="width: 44%; vertical-align: top; padding-left: 18px;">
                <div style="background: #111827; color: #ffffff; text-align: center; font-size: 18px; font-weight: 800; letter-spacing: 1px; padding: 9px 12px; border-radius: 5px; text-transform: uppercase; margin-bottom: 10px;">
                  GST TAX INVOICE
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; color: #111827;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 5px 0; color: #1f2937;">Invoice No:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #111827;">${invNumber}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 5px 0; color: #1f2937;">Order ID:</td>
                    <td style="padding: 5px 0; color: #111827;">#${orderId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 5px 0; color: #1f2937;">Invoice Date:</td>
                    <td style="padding: 5px 0; color: #111827;">${formattedInvoiceDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0 0; color: #1f2937;">Payment Method:</td>
                    <td style="padding: 5px 0 0; color: #111827; text-transform: uppercase;">${paymentMethod}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- 2. BILLED & SHIPPED TO + SUPPLY DETAILS -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 14px;">
          <tr>
            <td style="width: 52%; vertical-align: top; padding-right: 7px;">
              <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden; min-height: 126px;">
                <div style="background: #efefef; padding: 7px 14px; border-bottom: 1px solid #e5e7eb; font-size: 11.5px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                  BILLED &amp; SHIPPED TO
                </div>
                <div style="padding: 11px 14px; font-size: 12.5px; color: #1f2937; line-height: 1.45;">
                  <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 3px;">
                    ${customerName}
                  </div>
                  <div>${address}</div>
                  <div style="margin-top: 7px; color: #111827;">
                    <strong>&#9742;</strong> ${phone}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>&#9993;</strong> ${trimmedEmail}
                  </div>
                </div>
              </div>
            </td>

            <td style="width: 48%; vertical-align: top; padding-left: 7px;">
              <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden; min-height: 126px;">
                <div style="background: #efefef; padding: 7px 14px; border-bottom: 1px solid #e5e7eb; font-size: 11.5px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                  SUPPLY DETAILS
                </div>
                <div style="padding: 12px 14px; font-size: 12.5px; color: #111827;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0 12px; font-weight: 800; width: 44%;">Place of Supply:</td>
                      <td style="padding: 4px 0 12px;">India</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: 800; vertical-align: middle;">Status:</td>
                      <td style="padding: 4px 0; vertical-align: middle;">
                        <span style="display: inline-block; background: #f3f4f6; border: 1.5px solid #374151; border-radius: 5px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; color: #111827;">
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
        <div style="border: 1.5px solid #6b7280; border-radius: 6px; overflow: hidden; margin-bottom: 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #efefef; color: #111827; font-size: 11.5px; font-weight: 800;">
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">#</th>
                <th style="padding: 9px 8px; border: 1px solid #9ca3af; text-align: left;">Item Description</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">HSN</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">Qty</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">Rate (₹)</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">Taxable Value (₹)</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">CGST</th>
                <th style="padding: 9px 6px; border: 1px solid #9ca3af; text-align: center;">SGST</th>
                <th style="padding: 9px 8px; border: 1px solid #9ca3af; text-align: right;">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- 4. AMOUNT IN WORDS & TAX TOTALS -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 18px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 7px;">
              <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden;">
                <div style="background: #efefef; padding: 7px 14px; border-bottom: 1px solid #e5e7eb; font-size: 11.5px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                  AMOUNT IN WORDS
                </div>
                <div style="padding: 14px; font-size: 13px; font-weight: 800; color: #111827; line-height: 1.45;">
                  ${invoiceObj.amountInWords}
                </div>
              </div>
            </td>

            <td style="width: 50%; vertical-align: top; padding-left: 7px;">
              <div style="border: 1.5px solid #9ca3af; border-radius: 6px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; color: #111827;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 7px 14px; color: #1f2937;">Total Taxable Value:</td>
                    <td style="padding: 7px 14px; text-align: right; font-weight: 800;">₹${formatINR(invoiceObj.subtotal)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 7px 14px; color: #1f2937;">Add: CGST (${cgstLabel})</td>
                    <td style="padding: 7px 14px; text-align: right;">₹${formatINR(invoiceObj.cgstAmount)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 7px 14px; color: #1f2937;">Add: SGST (${sgstLabel})</td>
                    <td style="padding: 7px 14px; text-align: right;">₹${formatINR(invoiceObj.sgstAmount)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #d1d5db;">
                    <td style="padding: 7px 14px; color: #1f2937;">Total GST (${gstLabel})</td>
                    <td style="padding: 7px 14px; text-align: right; font-weight: 800;">₹${formatINR(invoiceObj.totalTax)}</td>
                  </tr>
                  <tr style="background: #efefef;">
                    <td style="padding: 10px 14px; font-size: 16px; font-weight: 800; color: #111827;">Grand Total:</td>
                    <td style="padding: 10px 14px; text-align: right; font-size: 18px; font-weight: 800; color: #111827;">₹${formatINR(invoiceObj.grandTotal)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>

        <!-- 5. INVOICE FOOTER -->
        <div style="border-top: 1.5px solid #374151; padding-top: 12px; text-align: center; font-size: 12.5px; color: #111827; line-height: 1.5;">
          <strong>Thank you for shopping with ${invoiceObj.storeName}.</strong><br/>
          <span style="color: #374151;">We appreciate your support!</span>
        </div>

      </div>

      <!-- CTA Buttons -->
      <div style="padding: 14px 24px 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
        <a href="${baseUrl}/shop" style="background-color: #111827; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 12.5px; display: inline-block; margin: 4px;">
          Continue Shopping
        </a>
        <a href="${whatsappUrl}" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 12.5px; display: inline-block; margin: 4px;">
          💬 Chat on WhatsApp
        </a>
        <p style="margin: 10px 0 0; font-size: 11px; color: #6b7280;">
          A printable copy of your GST Tax Invoice (<strong>GST-Invoice-${invNumber}.html</strong>) is attached to this email.
        </p>
      </div>

    </div>
  </body>
  </html>
  `;

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || OWNER_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const logoFilePath = path.join(process.cwd(), "public", "icons", "apple-touch-icon.png");
      const hasLogoFile = fs.existsSync(logoFilePath);

      const info = await transporter.sendMail({
        from: `"${storeName}" <${smtpUser}>`,
        to: trimmedEmail,
        subject: `🎉 Order #${orderId} Approved | GST Invoice ${invNumber} - ${storeName}`,
        html: emailHtml,
        attachments: [
          ...(hasLogoFile
            ? [
                {
                  filename: "babybloom-logo.png",
                  path: logoFilePath,
                  cid: "babybloom-logo",
                },
              ]
            : []),
          {
            filename: `GST-Invoice-${invNumber}.html`,
            content: standaloneInvoiceHtml,
            contentType: "text/html",
          },
        ],
      });

      console.log(`[Customer Approval Email + GST Invoice Sent] Delivered to ${trimmedEmail} for Order #${orderId} (Invoice ${invNumber}). MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, invoiceNumber: invNumber };
    } catch (err) {
      console.error(`[Customer Email Error] Failed to send approval email to ${trimmedEmail}:`, err);
      return { success: false, error: err, invoiceNumber: invNumber };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[CUSTOMER ORDER APPROVED EMAIL + GST INVOICE - ORDER #${orderId}]`);
    console.log(`To: ${trimmedEmail}`);
    console.log(`Invoice No: ${invNumber} | Order ID: #${orderId}`);
    console.log(`Customer: ${customerName} | Taxable: ₹${invoiceObj.subtotal} | GST: ₹${invoiceObj.totalTax} | Grand Total: ₹${invoiceObj.grandTotal}`);
    if (invoiceObj.storeGstNumber) console.log(`Store GSTIN: ${invoiceObj.storeGstNumber}`);
    console.log(`Attachment: GST-Invoice-${invNumber}.html`);
    console.log(`Notice: To enable actual Gmail sending, add SMTP_PASS or GMAIL_APP_PASSWORD in your .env file.`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true, invoiceNumber: invNumber };
  }
}
