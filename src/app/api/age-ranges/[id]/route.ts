import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { 
  dbFindAgeRangeByName, 
  dbUpdateAgeRange, 
  dbDeleteAgeRange 
} from "@/lib/ageRanges";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// PUT /api/age-ranges/[id] - Update an existing age range
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { id } = await params;
    const rangeId = parseInt(id, 10);
    if (isNaN(rangeId)) {
      return NextResponse.json({ error: "Invalid age range ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Age range name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if duplicate name in another item
    const duplicate = await dbFindAgeRangeByName(trimmedName, rangeId);
    if (duplicate) {
      return NextResponse.json(
        { error: `Another age range with name "${trimmedName}" already exists` },
        { status: 409 }
      );
    }

    const updated = await dbUpdateAgeRange(rangeId, trimmedName);

    // Count products linked
    const productCount = await prisma.product.count({
      where: { ageGroup: trimmedName },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      order: updated.order,
      productCount,
    });
  } catch (error) {
    console.error("PUT /api/age-ranges/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to update age range" },
      { status: 500 }
    );
  }
}

// DELETE /api/age-ranges/[id] - Delete an age range
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const { id } = await params;
    const rangeId = parseInt(id, 10);
    if (isNaN(rangeId)) {
      return NextResponse.json({ error: "Invalid age range ID" }, { status: 400 });
    }

    await dbDeleteAgeRange(rangeId);

    return NextResponse.json({ success: true, message: `Age range deleted` });
  } catch (error) {
    console.error("DELETE /api/age-ranges/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to delete age range" },
      { status: 500 }
    );
  }
}
