import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch current order with its items
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // 2. If transitioning to "approved" (from pending or rejected): DECREMENT stock
      if (status === "approved" && existingOrder.status !== "approved") {
        for (const item of existingOrder.items) {
          if (item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true, stock: true, name: true },
            });

            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await tx.product.update({
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
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true, stock: true, name: true },
            });

            if (product) {
              const restoredStock = product.stock + item.quantity;
              await tx.product.update({
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
      return await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true },
      });
    });

    return NextResponse.json(updatedOrder);
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

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    return NextResponse.json({ success: true, deletedId: orderId });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

