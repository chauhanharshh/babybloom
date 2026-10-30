import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category, categories, ageGroup, ageGroups, style, imageUrl } = body;

    const finalCategories: string[] = Array.isArray(categories) && categories.length > 0
      ? categories.map((c: any) => String(c).trim()).filter(Boolean)
      : (category ? [String(category).trim()] : ["Girls"]);

    const finalAgeGroups: string[] = Array.isArray(ageGroups) && ageGroups.length > 0
      ? ageGroups.map((a: any) => String(a).trim()).filter(Boolean)
      : (ageGroup ? [String(ageGroup).trim()] : ["0-1 Yrs"]);

    const primaryCategory = finalCategories[0] || "Girls";
    const primaryAgeGroup = finalAgeGroups.join(", ") || "0-1 Yrs";

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category: primaryCategory,
        categories: finalCategories,
        ageGroup: primaryAgeGroup,
        ageGroups: finalAgeGroups,
        style: style || "Regular",
        imageUrl: imageUrl || null,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
