import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendOrderNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getActiveOffers, calculateProductOffer } from "@/lib/offers";

function sanitizeInput(val?: string, maxLen = 200): string {
  if (!val || typeof val !== "string") return "";
  return val
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

class OutOfStockError extends Error {
  productId: number;
  availableStock: number;
  constructor(message: string, productId: number, availableStock: number) {
    super(message);
    this.name = "OutOfStockError";
    this.productId = productId;
    this.availableStock = availableStock;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, {
      keyPrefix: "create_order",
      maxRequests: 10,
      windowMs: 10 * 60 * 1000, // Max 10 orders per 10 minutes per IP
      blockDurationMs: 10 * 60 * 1000,
    });
    if (!rate.allowed) {
      const waitMins = Math.max(1, Math.ceil(rate.retryAfterSeconds / 60));
      return NextResponse.json(
        {
          error: `Too many order requests from your network. Please wait ${waitMins} minute(s) before placing another order.`,
        },
        { status: 429, headers: rate.headers }
      );
    }

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

    // Server-side price verification to prevent client-side price tampering
    const productIdsInCart = Array.from(
      new Set(
        cart
          .map((i) => parseInt(String(i.id), 10))
          .filter((n) => !Number.isNaN(n))
      )
    );
    const [dbProductsForPricing, activeOffers] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIdsInCart } },
        select: { id: true, name: true, price: true, category: true, categories: true },
      }),
      getActiveOffers(),
    ]);
    const verifiedPriceMap = new Map<number, { price: number; name: string }>();
    for (const p of dbProductsForPricing) {
      const offer = calculateProductOffer(p.id, p.category, p.price, activeOffers, p.categories);
      verifiedPriceMap.set(p.id, { price: offer.price, name: p.name });
    }

    const sanitizedCart = cart.map((item) => {
      const pid = parseInt(String(item.id), 10);
      const verified = !Number.isNaN(pid) ? verifiedPriceMap.get(pid) : undefined;
      const safeQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
      const safePrice = verified ? verified.price : Math.max(1, Number(item.price) || 1);
      const safeName = verified ? verified.name : sanitizeInput(item.name, 120) || "BabyBloom Item";
      return {
        ...item,
        name: safeName,
        price: safePrice,
        quantity: safeQty,
        ageGroup: sanitizeInput(item.ageGroup, 40) || "0-1 Yrs",
      };
    });

    const total = sanitizedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Encode full customer details in customerName string safely (JSON)
    const customerInfoJson = JSON.stringify({
      name: sanitizeInput(customerName, 80) || "Customer",
      email: sanitizeInput(customerEmail, 120),
      phone: sanitizeInput(phone, 30),
      address: sanitizeInput(address, 300),
      paymentMethod: sanitizeInput(paymentMethod, 30) || "COD",
    });

async function createOrderResilient(
  customerInfoJson: string,
  total: number,
  cart: { id: string; name: string; price: number; quantity: number; ageGroup?: string }[]
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const reservedItems: { productId: number; qty: number }[] = [];

    try {
      // 1. Find existing valid product IDs
      const existingProducts = await prisma.product.findMany({
        select: { id: true, name: true, stock: true },
        orderBy: { id: "asc" },
      });

      let fallbackProductId = existingProducts[0]?.id;

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

      // 2. First-Checkout-Wins: Atomically reserve/decrement stock for each real product in cart
      const aggregatedByProduct = new Map<number, { qty: number; name: string }>();
      for (const item of cart) {
        const parsedId = parseInt(String(item.id), 10);
        if (!Number.isNaN(parsedId) && validProductIds.has(parsedId)) {
          const reqQty = Math.max(1, Number(item.quantity) || 1);
          const prev = aggregatedByProduct.get(parsedId);
          aggregatedByProduct.set(parsedId, {
            qty: (prev?.qty || 0) + reqQty,
            name: item.name,
          });
        }
      }

      for (const [productId, { qty, name }] of aggregatedByProduct.entries()) {
        // Atomic row-locked conditional stock deduction in PostgreSQL
        const updated = await prisma.product.updateMany({
          where: {
            id: productId,
            stock: { gte: qty },
          },
          data: {
            stock: { decrement: qty },
          },
        });

        if (updated.count === 0) {
          // Another user just bought the last unit(s) -> Roll back any earlier reserved items
          for (const prev of reservedItems) {
            await prisma.product
              .update({
                where: { id: prev.productId },
                data: { stock: { increment: prev.qty } },
              })
              .catch(() => {});
          }
          reservedItems.length = 0;

          const latestProd = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, name: true },
          });
          const avail = Math.max(0, latestProd?.stock ?? 0);
          const prodName = (latestProd?.name || name).trim();

          const msg =
            avail <= 0
              ? `Sorry! "${prodName}" just went Out of Stock while you were checking out.`
              : `Sorry! Only ${avail} unit(s) of "${prodName}" left in stock.`;

          throw new OutOfStockError(msg, productId, avail);
        }

        reservedItems.push({ productId, qty });
      }

      validProductIds.add(fallbackProductId);

      // 3. Create the order + items
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
                quantity: Math.max(1, Number(item.quantity) || 1),
                ageGroup: item.ageGroup || "1-6 Yrs",
              };
            }),
          },
        },
        include: { items: true },
      });

      return newOrder;
    } catch (err) {
      // Roll back reserved stock if order creation failed after stock deduction
      if (reservedItems.length > 0) {
        for (const prev of reservedItems) {
          await prisma.product
            .update({
              where: { id: prev.productId },
              data: { stock: { increment: prev.qty } },
            })
            .catch(() => {});
        }
        reservedItems.length = 0;
      }

      // Do not retry if out of stock
      if (err instanceof OutOfStockError) {
        throw err;
      }

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

    const order = await createOrderResilient(customerInfoJson, total, sanitizedCart);
    revalidatePath("/", "layout");

    // Extract base URL from request origin/headers
    const origin = req.nextUrl.origin || req.headers.get("origin") || "http://localhost:3000";

    // Send email notification to owner (babybloom.bb2024@gmail.com) with Accept Order option
    sendOrderNotificationEmail({
      orderId: order.id,
      customerName: sanitizeInput(customerName, 80) || "Customer",
      customerEmail: sanitizeInput(customerEmail, 120),
      phone: sanitizeInput(phone, 30),
      address: sanitizeInput(address, 300),
      paymentMethod: sanitizeInput(paymentMethod, 30) || "COD",
      total,
      items: sanitizedCart.map((i) => ({
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
    if (error instanceof OutOfStockError) {
      return NextResponse.json(
        {
          error: error.message,
          outOfStockProductId: String(error.productId),
          availableStock: error.availableStock,
        },
        { status: 409 }
      );
    }
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

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
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

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
