import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendOrderApprovedEmailToCustomer } from "@/lib/email";
import { getStoreProfile } from "@/lib/profile";
import { createOrGetInvoiceForOrder } from "@/lib/invoices";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

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
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

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

    // 2. Mark for customer approval email if transitioning to "approved"
    if (status === "approved" && existingOrder.status !== "approved") {
      shouldSendCustomerApprovalEmail = true;
    }

    // 3. Since stock is already atomically reserved when the order is placed ("pending"):
    //    - If transitioning FROM "rejected" back to "pending" or "approved": DECREMENT stock again
    if (existingOrder.status === "rejected" && status !== "rejected") {
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
              `[Stock Decremented] Order #${orderId} (${existingOrder.status} -> ${status}): "${product.name}" (ID: ${product.id}) stock updated from ${product.stock} to ${newStock} (-${item.quantity})`
            );
          }
        }
      }
    }

    // 4. If transitioning FROM "pending" or "approved" to "rejected": RESTORE reserved stock
    if (status === "rejected" && existingOrder.status !== "rejected") {
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
              `[Stock Restored] Order #${orderId} Rejected: "${product.name}" (ID: ${product.id}) stock restored from ${product.stock} to ${restoredStock} (+${item.quantity})`
            );
          }
        }
      }
    }

    // 5. Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    revalidatePath("/", "layout");

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { id } = await params;
    const orderId = parseInt(id);

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    // If a pending order is deleted before fulfillment, restore its reserved stock
    if (existingOrder && existingOrder.status === "pending") {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await prisma.product
            .update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
            .catch(() => {});
        }
      }
    }

    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, deletedId: orderId });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

