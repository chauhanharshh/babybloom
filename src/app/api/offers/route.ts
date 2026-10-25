import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const offers = await prisma.offer.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      discountPercent,
      scope,
      targetCategory,
      productIds,
      couponCode,
      bannerText,
      isActive,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const discountNum = parseFloat(discountPercent) || 0;
    if (discountNum < 0 || discountNum > 100) {
      return NextResponse.json({ error: "Discount percent must be between 0 and 100" }, { status: 400 });
    }

    const parsedProductIds = Array.isArray(productIds)
      ? productIds.map((id: number | string) => (typeof id === "number" ? id : parseInt(id))).filter((id: number) => !isNaN(id))
      : [];

    const offer = await prisma.offer.create({
      data: {
        title,
        description: description || null,
        discountPercent: discountNum,
        scope: scope || "SITEWIDE",
        targetCategory: targetCategory || null,
        productIds: parsedProductIds,
        couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
        bannerText: bannerText || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
