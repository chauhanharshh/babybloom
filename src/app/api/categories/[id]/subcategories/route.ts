import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/categories/[id]/subcategories - Add a subcategory to this category
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Subcategory name is required" }, { status: 400 });
    }

    const trimmed = name.trim();
    const slug = slugify(trimmed);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { subcategories: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if subcategory already exists under this category
    const exists = category.subcategories.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: `Subcategory "${trimmed}" already exists under ${category.name}` },
        { status: 409 }
      );
    }

    const created = await prisma.subcategory.create({
      data: {
        name: trimmed,
        slug,
        categoryId: categoryId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
