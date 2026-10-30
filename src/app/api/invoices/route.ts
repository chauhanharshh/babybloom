import { NextRequest, NextResponse } from "next/server";
import {
  getAllInvoices,
  createOrGetInvoiceForOrder,
  generateGstInvoiceHtml,
} from "@/lib/invoices";
import { sendOrderApprovedEmailToCustomer } from "@/lib/email";
import { getStoreProfile } from "@/lib/profile";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");
    const format = searchParams.get("format");

    if (orderIdParam && format === "html") {
      const inv = await createOrGetInvoiceForOrder(parseInt(orderIdParam, 10));
      if (!inv) {
        return new NextResponse("Invoice not found", { status: 404 });
      }
      const html = generateGstInvoiceHtml(inv);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    const invoices = await getAllInvoices();
    return NextResponse.json(
      { success: true, invoices },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const body = await req.json();
    const { orderId, action } = body as { orderId: number; action?: "generate" | "resend_email" };

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const invoice = await createOrGetInvoiceForOrder(Number(orderId));
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let emailSent = false;
    if (action === "resend_email" && invoice.customerEmail) {
      const storeProfile = await getStoreProfile();
      const origin = req.nextUrl.origin || req.headers.get("origin") || "https://babybloom.in";
      const res = await sendOrderApprovedEmailToCustomer({
        orderId: invoice.orderId,
        invoiceNumber: invoice.invoiceNumber,
        invoice,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        phone: invoice.customerPhone,
        address: invoice.customerAddress,
        paymentMethod: invoice.paymentMethod,
        total: invoice.grandTotal,
        items: invoice.items.map((i) => ({
          name: i.name,
          price: i.unitPrice,
          quantity: i.quantity,
          ageGroup: i.ageGroup,
        })),
        gstNumber: storeProfile.gstNumber,
        storeName: storeProfile.storeName,
        whatsappNumber: storeProfile.whatsappNumber,
        baseUrl: origin,
      });
      emailSent = Boolean(res?.success);
    }

    return NextResponse.json({ success: true, invoice, emailSent });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process invoice" },
      { status: 500 }
    );
  }
}

