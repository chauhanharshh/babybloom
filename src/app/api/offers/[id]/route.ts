import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerId = parseInt(id);
    if (isNaN(offerId)) {
      return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
    }

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

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (discountPercent !== undefined) data.discountPercent = parseFloat(discountPercent) || 0;
    if (scope !== undefined) data.scope = scope;
    if (targetCategory !== undefined) data.targetCategory = targetCategory || null;
    if (productIds !== undefined) {
      data.productIds = Array.isArray(productIds)
        ? productIds.map((pid: number | string) => (typeof pid === "number" ? pid : parseInt(pid))).filter((pid: number) => !isNaN(pid))
        : [];
    }
    if (couponCode !== undefined) data.couponCode = couponCode ? couponCode.trim().toUpperCase() : null;
    if (bannerText !== undefined) data.bannerText = bannerText || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerId = parseInt(id);
    if (isNaN(offerId)) {
      return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
