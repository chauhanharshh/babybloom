import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // A simple query to keep the database connection active
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", message: "Database is awake and active" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to connect to database" },
      { status: 500 }
    );
  }
}
