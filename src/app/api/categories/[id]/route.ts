import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

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

// PUT /api/categories/[id] - Update category
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, imageUrl } = body;

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
    } = {};

    if (name && typeof name === "string" && name.trim()) {
      const trimmed = name.trim();
      updateData.name = trimmed;
      updateData.slug = slugify(trimmed);
    }
    if (description !== undefined) {
      updateData.description = typeof description === "string" ? description.trim() : null;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = typeof imageUrl === "string" ? imageUrl.trim() : null;
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        subcategories: {
          orderBy: { id: "asc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Cascade delete deletes subcategories automatically
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
