import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
