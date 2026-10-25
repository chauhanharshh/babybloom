import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/subcategories/[id] - Delete a subcategory
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const subcategoryId = parseInt(id);

    if (isNaN(subcategoryId)) {
      return NextResponse.json({ error: "Invalid subcategory ID" }, { status: 400 });
    }

    const existing = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    await prisma.subcategory.delete({
      where: { id: subcategoryId },
    });

    return NextResponse.json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
