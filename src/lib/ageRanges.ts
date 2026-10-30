import prisma from "@/lib/prisma";

export const DEFAULT_AGE_RANGES = [
  "0-6 Months",
  "6-12 Months",
  "0-1 Yrs",
  "1-2 Yrs",
  "2-3 Yrs",
  "3-4 Yrs",
  "4-5 Yrs",
  "5-6 Yrs",
  "1-6 Yrs",
];

export interface AgeRangeItem {
  id: number;
  name: string;
  order: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export { parseAgeRangeSortKey, compareAgeRanges, sortAgeRanges } from "@/utils/ageRanges";
import { sortAgeRanges } from "@/utils/ageRanges";


// Resilient DB Access Layer (Works with both Prisma Client model and Raw SQL fallback)
export async function dbGetAllAgeRanges(): Promise<any[]> {
  try {
    if ((prisma as any).ageRange?.findMany) {
      return await (prisma as any).ageRange.findMany({
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
    }
  } catch {
    // fallback to raw sql
  }
  return await (prisma as any).$queryRawUnsafe(
    'SELECT id, name, "order", "createdAt", "updatedAt" FROM "AgeRange" ORDER BY "order" ASC, id ASC'
  );
}

export async function dbFindAgeRangeByName(name: string, excludeId?: number): Promise<any | null> {
  const trimmed = name.trim();
  try {
    if ((prisma as any).ageRange?.findFirst) {
      return await (prisma as any).ageRange.findFirst({
        where: {
          name: { equals: trimmed, mode: "insensitive" },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });
    }
  } catch {
    // fallback
  }

  if (excludeId) {
    const rows = await (prisma as any).$queryRawUnsafe(
      'SELECT id, name, "order" FROM "AgeRange" WHERE LOWER(name) = LOWER($1) AND id != $2 LIMIT 1',
      trimmed,
      excludeId
    );
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }

  const rows = await (prisma as any).$queryRawUnsafe(
    'SELECT id, name, "order" FROM "AgeRange" WHERE LOWER(name) = LOWER($1) LIMIT 1',
    trimmed
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function dbCreateAgeRange(name: string, order?: number): Promise<any> {
  const trimmed = name.trim();
  const nextOrder = order ?? 10;
  try {
    if ((prisma as any).ageRange?.create) {
      return await (prisma as any).ageRange.create({
        data: { name: trimmed, order: nextOrder },
      });
    }
  } catch {
    // fallback
  }

  const rows = await (prisma as any).$queryRawUnsafe(
    'INSERT INTO "AgeRange" (name, "order", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id, name, "order", "createdAt", "updatedAt"',
    trimmed,
    nextOrder
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : { id: Date.now(), name: trimmed, order: nextOrder };
}

export async function dbUpdateAgeRange(id: number, name: string): Promise<any> {
  const trimmed = name.trim();
  try {
    if ((prisma as any).ageRange?.update) {
      return await (prisma as any).ageRange.update({
        where: { id },
        data: { name: trimmed },
      });
    }
  } catch {
    // fallback
  }

  const rows = await (prisma as any).$queryRawUnsafe(
    'UPDATE "AgeRange" SET name = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, name, "order", "createdAt", "updatedAt"',
    trimmed,
    id
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : { id, name: trimmed, order: 0 };
}

export async function dbDeleteAgeRange(id: number): Promise<void> {
  try {
    if ((prisma as any).ageRange?.delete) {
      await (prisma as any).ageRange.delete({ where: { id } });
      return;
    }
  } catch {
    // fallback
  }

  await (prisma as any).$executeRawUnsafe(
    'DELETE FROM "AgeRange" WHERE id = $1',
    id
  );
}

export async function getAgeRangesWithCounts(): Promise<AgeRangeItem[]> {
  try {
    let ranges = await dbGetAllAgeRanges();

    // Auto-seed defaults if table is empty
    if (!ranges || ranges.length === 0) {
      for (let i = 0; i < DEFAULT_AGE_RANGES.length; i++) {
        try {
          await dbCreateAgeRange(DEFAULT_AGE_RANGES[i], i + 1);
        } catch {
          // ignore duplicates
        }
      }
      ranges = await dbGetAllAgeRanges();
    }

    // Get product count per ageGroup (including multi-ageGroup products)
    const products = await prisma.product.findMany({
      select: { ageGroup: true, ageGroups: true },
    });

    const countMap: Record<string, number> = {};
    for (const p of products) {
      const allAges = (p.ageGroups && p.ageGroups.length > 0)
        ? p.ageGroups
        : (p.ageGroup ? [p.ageGroup] : []);
      for (const a of allAges) {
        if (a) {
          const key = a.trim().toLowerCase();
          countMap[key] = (countMap[key] || 0) + 1;
        }
      }
    }

    const mapped = (ranges || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      order: r.order ?? 0,
      productCount: countMap[r.name.trim().toLowerCase()] || 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
    }));

    return sortAgeRanges(mapped);
  } catch (error) {
    console.error("Error in getAgeRangesWithCounts:", error);
    return sortAgeRanges(
      DEFAULT_AGE_RANGES.map((name, index) => ({
        id: index + 1,
        name,
        order: index + 1,
        productCount: 0,
      }))
    );
  }
}
