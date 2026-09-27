import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, customerName } = body as {
      cart: { id: string; name: string; price: number; quantity: number; ageGroup: string }[];
      customerName?: string;
    };

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName: customerName || "WhatsApp Customer",
          total,
          status: "pending",
          items: {
            create: cart.map((item) => ({
              productId: parseInt(item.id),
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              ageGroup: item.ageGroup,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement stock for each product
      for (const item of cart) {
        await tx.product.update({
          where: { id: parseInt(item.id) },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
