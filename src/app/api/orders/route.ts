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

async function createOrderResilient(
  customerInfoJson: string,
  total: number,
  cart: { id: string; name: string; price: number; quantity: number; ageGroup?: string }[]
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 1. Find existing valid product IDs to satisfy foreign key constraint
      const existingProducts = await prisma.product.findMany({
        select: { id: true },
        orderBy: { id: "asc" },
      });

      let fallbackProductId = existingProducts[0]?.id;

      // If no products exist in the DB at all, create a fallback product so foreign key never fails
      if (!fallbackProductId) {
        const firstCartItem = cart[0];
        const createdFallback = await prisma.product.create({
          data: {
            name: firstCartItem?.name || "Baby Bloom Outfit",
            price: firstCartItem?.price || 499,
            stock: 100,
            category: "Girls",
            ageGroup: firstCartItem?.ageGroup || "1-6 Yrs",
            style: "Regular",
          },
        });
        fallbackProductId = createdFallback.id;
      }

      const validProductIds = new Set(existingProducts.map((p) => p.id));
      validProductIds.add(fallbackProductId);

      // 2. Create the order + items in a single atomic Prisma query (avoids 2s interactive $transaction timeout on cold DB)
      const newOrder = await prisma.order.create({
        data: {
          customerName: customerInfoJson,
          total,
          status: "pending",
          items: {
            create: cart.map((item) => {
              const parsedId = parseInt(String(item.id), 10);
              const productId =
                !Number.isNaN(parsedId) && validProductIds.has(parsedId)
                  ? parsedId
                  : fallbackProductId!;
              return {
                productId,
                name: item.name,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                ageGroup: item.ageGroup || "1-6 Yrs",
              };
            }),
          },
        },
        include: { items: true },
      });

      return newOrder;
    } catch (err) {
      lastError = err;
      const errMsg = (err as Error)?.message || String(err);
      console.warn(`[Order Create Attempt ${attempt}/3 Failed]:`, errMsg);

      // If sequence is out of sync (P2002 on id), repair sequence before retrying
      if (errMsg.includes("Unique constraint failed") && errMsg.includes("id")) {
        try {
          await prisma.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"Order"', 'id'), COALESCE((SELECT MAX(id) FROM "Order"), 0) + 1, false);`
          );
          await prisma.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"OrderItem"', 'id'), COALESCE((SELECT MAX(id) FROM "OrderItem"), 0) + 1, false);`
          );
        } catch {
          // ignore
        }
      }

      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }

  throw lastError;
}

    const order = await createOrderResilient(customerInfoJson, total, cart);

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

    // Reset sequence so future orders start cleanly from #1 again
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Order_id_seq" RESTART WITH 1;`);
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1;`);
    } catch (seqErr) {
      console.warn("Notice: Sequence reset skipped:", seqErr);
    }

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
