import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }

    const body = await request.json();
    const { imageUrl, title, alt, linkUrl, order, isActive } = body;

    const data: Record<string, unknown> = {};
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (title !== undefined) data.title = title;
    if (alt !== undefined) data.alt = alt;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;
    if (order !== undefined) data.order = parseInt(order) || 0;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.banner.update({
      where: { id: bannerId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
