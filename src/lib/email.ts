import nodemailer from "nodemailer";

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

  const approveUrl = `${baseUrl}/admin/orders/approve?id=${orderId}`;
  const adminOrdersUrl = `${baseUrl}/admin/orders`;

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
