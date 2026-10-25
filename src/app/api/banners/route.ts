import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const banners = await prisma.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, title, alt, linkUrl, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title: title || "",
        alt: alt || "Babybloom Banner",
        linkUrl: linkUrl || "/shop",
        order: typeof order === "number" ? order : parseInt(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
