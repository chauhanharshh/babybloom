import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOrderApprovedEmailToCustomer } from "@/lib/email";
import { getStoreProfile } from "@/lib/profile";
import { createOrGetInvoiceForOrder } from "@/lib/invoices";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const { status } = await req.json();

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let shouldSendCustomerApprovalEmail = false;

    // 1. Fetch current order with its items
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. If transitioning to "approved" (from pending or rejected): DECREMENT stock & mark for customer email
    if (status === "approved" && existingOrder.status !== "approved") {
      shouldSendCustomerApprovalEmail = true;
      for (const item of existingOrder.items) {
        if (item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true, name: true },
          });

          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: newStock },
            });
            console.log(
              `[Stock Decremented] Order #${orderId} Approved: "${product.name}" (ID: ${product.id}) stock updated from ${product.stock} to ${newStock} (-${item.quantity})`
            );
          }
        }
      }
    }

    // 3. If transitioning FROM "approved" to "rejected" (or pending): RESTORE stock
    if (status !== "approved" && existingOrder.status === "approved") {
      for (const item of existingOrder.items) {
        if (item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true, name: true },
          });

          if (product) {
            const restoredStock = product.stock + item.quantity;
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: restoredStock },
            });
            console.log(
              `[Stock Restored] Order #${orderId} marked as ${status}: "${product.name}" (ID: ${product.id}) stock restored from ${product.stock} to ${restoredStock} (+${item.quantity})`
            );
          }
        }
      }
    }

    // 4. Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    // 5. Generate GST Invoice & Send Order Approved email to the customer if order is approved
    let customerEmailSent = false;
    let invoiceNumber = "";

    if (status === "approved") {
      try {
        const generatedInvoice = await createOrGetInvoiceForOrder(updatedOrder.id);
        if (generatedInvoice) {
          invoiceNumber = generatedInvoice.invoiceNumber;
        }

        if (shouldSendCustomerApprovalEmail) {
          let parsedCustomer = {
            name: updatedOrder.customerName || "Customer",
            email: "",
            phone: "",
            address: "",
            paymentMethod: "COD",
          };

          try {
            if (updatedOrder.customerName && updatedOrder.customerName.startsWith("{")) {
              const json = JSON.parse(updatedOrder.customerName);
              parsedCustomer = {
                name: json.name || "Customer",
                email: json.email || "",
                phone: json.phone || "",
                address: json.address || "",
                paymentMethod: json.paymentMethod || "COD",
              };
            }
          } catch {
            // Fallback to raw customerName
          }

          if (parsedCustomer.email) {
            const storeProfile = await getStoreProfile();
            const origin = req.nextUrl.origin || req.headers.get("origin") || "https://babybloom.in";
            const emailRes = await sendOrderApprovedEmailToCustomer({
              orderId: updatedOrder.id,
              invoiceNumber: generatedInvoice?.invoiceNumber,
              invoice: generatedInvoice,
              customerName: parsedCustomer.name,
              customerEmail: parsedCustomer.email,
              phone: parsedCustomer.phone,
              address: parsedCustomer.address,
              paymentMethod: parsedCustomer.paymentMethod,
              total: updatedOrder.total,
              items: updatedOrder.items.map((i) => ({
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                ageGroup: i.ageGroup,
              })),
              gstNumber: storeProfile.gstNumber,
              storeName: storeProfile.storeName,
              whatsappNumber: storeProfile.whatsappNumber,
              baseUrl: origin,
            });
            customerEmailSent = Boolean(emailRes?.success);
          }
        }
      } catch (invoiceOrEmailErr) {
        console.error("[Invoice / Customer Approval Email Error]:", invoiceOrEmailErr);
      }
    }

    return NextResponse.json({ ...updatedOrder, customerEmailSent, invoiceNumber });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    return NextResponse.json({ success: true, deletedId: orderId });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

