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

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/categories - List all categories with subcategories and product counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Also get product count per category
    const productCounts = await prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    for (const item of productCounts) {
      countMap[item.category.toLowerCase()] = item._count.id;
    }

    const enriched = categories.map((c) => ({
      ...c,
      productCount: countMap[c.name.toLowerCase()] || 0,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories - Create a new category with optional subcategories
export async function POST(req: Request) {
  try {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;

    const body = await req.json();
    const { name, description, imageUrl, subcategories } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
          { slug: slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${trimmedName}" already exists` },
        { status: 409 }
      );
    }

    // Process subcategories list if provided
    let subcategoryData: { name: string; slug: string }[] = [];
    if (Array.isArray(subcategories)) {
      subcategoryData = subcategories
        .filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s: string) => ({
          name: s.trim(),
          slug: slugify(s.trim()),
        }));
    }

    // Add default "Regular" subcategory if none provided
    if (subcategoryData.length === 0) {
      subcategoryData = [{ name: "Regular", slug: "regular" }];
    }

    // Deduplicate by name
    const uniqueSubs: { name: string; slug: string }[] = [];
    const seen = new Set<string>();
    for (const sub of subcategoryData) {
      const lower = sub.name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueSubs.push(sub);
      }
    }

    const created = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        subcategories: {
          create: uniqueSubs,
        },
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create category" },
      { status: 500 }
    );
  }
}
