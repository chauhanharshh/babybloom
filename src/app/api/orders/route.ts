import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOrderNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, customerName, customerEmail, phone, address, paymentMethod } = body as {
      cart: { id: string; name: string; price: number; quantity: number; ageGroup?: string }[];
      customerName?: string;
      customerEmail?: string;
      phone?: string;
      address?: string;
      paymentMethod?: string;
    };

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Encode full customer details in customerName string safely (JSON)
    const customerInfoJson = JSON.stringify({
      name: customerName?.trim() || "Customer",
      email: customerEmail?.trim() || "",
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      paymentMethod: paymentMethod || "COD",
    });

    const order = await prisma.$transaction(async (tx) => {
      // Find existing valid product IDs to satisfy foreign key constraint
      const existingProducts = await tx.product.findMany({ select: { id: true } });
      const validProductIds = new Set(existingProducts.map((p) => p.id));
      const fallbackProductId = existingProducts[0]?.id || 1;

      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName: customerInfoJson,
          total,
          status: "pending",
          items: {
            create: cart.map((item) => {
              const parsedId = parseInt(item.id);
              const productId = validProductIds.has(parsedId) ? parsedId : fallbackProductId;
              return {
                productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                ageGroup: item.ageGroup || "1-6 Yrs",
              };
            }),
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

    // Extract base URL from request origin/headers
    const origin = req.nextUrl.origin || req.headers.get("origin") || "http://localhost:3000";

    // Send email notification to owner (babybloom.bb2024@gmail.com) with Accept Order option
    sendOrderNotificationEmail({
      orderId: order.id,
      customerName: customerName || "Customer",
      customerEmail: customerEmail || "",
      phone: phone || "",
      address: address || "",
      paymentMethod: paymentMethod || "COD",
      total,
      items: cart.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        ageGroup: i.ageGroup,
      })),
      baseUrl: origin,
    }).catch((err) => {
      console.error("[Email Notification Failed]:", err);
    });

    console.log(`[Order Created] ID: ${order.id}, Customer: ${customerName}, Total: ₹${total}`);
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    // Parse customer JSON metadata if present
    const formattedOrders = orders.map((order) => {
      let parsed = {
        name: order.customerName,
        email: "",
        phone: "",
        address: "",
        paymentMethod: "COD",
      };

      try {
        if (order.customerName && order.customerName.startsWith("{")) {
          const json = JSON.parse(order.customerName);
          parsed = {
            name: json.name || "Customer",
            email: json.email || "",
            phone: json.phone || "",
            address: json.address || "",
            paymentMethod: json.paymentMethod || "COD",
          };
        }
      } catch {
        // Fallback to raw string
      }

      return {
        id: order.id,
        customerName: parsed.name,
        customerEmail: parsed.email,
        phone: parsed.phone,
        address: parsed.address,
        paymentMethod: parsed.paymentMethod,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
      };
    });

    return NextResponse.json(formattedOrders, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const deletedItems = await prisma.orderItem.deleteMany();
    const deletedOrders = await prisma.order.deleteMany();
    return NextResponse.json({
      success: true,
      deletedOrders: deletedOrders.count,
      deletedItems: deletedItems.count,
    });
  } catch (error) {
    console.error("Failed to clear orders:", error);
    return NextResponse.json({ error: "Failed to clear orders" }, { status: 500 });
  }
}
