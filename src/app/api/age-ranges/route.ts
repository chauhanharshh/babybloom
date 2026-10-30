import { NextResponse } from "next/server";
import { 
  getAgeRangesWithCounts, 
  dbFindAgeRangeByName, 
  dbCreateAgeRange 
} from "@/lib/ageRanges";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET /api/age-ranges - List all age ranges with product count
export async function GET() {
  try {
    const ranges = await getAgeRangesWithCounts();
    return NextResponse.json(ranges);
  } catch (error) {
    console.error("GET /api/age-ranges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch age ranges" },
      { status: 500 }
    );
  }
}

// POST /api/age-ranges - Create a new age range
export async function POST(req: Request) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Age range name is required (e.g. '0-1 Yrs' or '6-7 Yrs')" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if already exists (case-insensitive)
    const existing = await dbFindAgeRangeByName(trimmedName);
    if (existing) {
      return NextResponse.json(
        { error: `Age range "${trimmedName}" already exists` },
        { status: 409 }
      );
    }

    const newRange = await dbCreateAgeRange(trimmedName);

    return NextResponse.json(
      {
        id: newRange.id,
        name: newRange.name,
        order: newRange.order,
        productCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/age-ranges error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to create age range" },
      { status: 500 }
    );
  }
}
