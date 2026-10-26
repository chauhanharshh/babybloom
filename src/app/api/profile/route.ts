import { NextResponse } from "next/server";
import { getStoreProfile, updateStoreProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getStoreProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateStoreProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update store profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
