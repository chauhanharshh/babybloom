import prisma from "@/lib/prisma";

export interface ActiveOffer {
  id: number;
  title: string;
  description: string | null;
  discountPercent: number;
  scope: string; // "SITEWIDE" | "PRODUCTS" | "CATEGORY"
  targetCategory: string | null;
  productIds: number[];
  couponCode: string | null;
  bannerText: string | null;
  isActive: boolean;
}

export async function getActiveOffers(): Promise<ActiveOffer[]> {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { discountPercent: "desc" },
    });
    return offers;
  } catch (error) {
    console.warn(
      "Notice: Active offers could not be fetched from DB (database may be offline or spinning up):",
      (error as Error)?.message || error
    );
    return [];
  }
}

export function calculateProductOffer(
  productId: number | string,
  category: string | undefined,
  basePrice: number,
  activeOffers: ActiveOffer[]
) {
  if (!activeOffers || activeOffers.length === 0) {
    return {
      price: basePrice,
      originalPrice: basePrice,
      discountPercent: 0,
      appliedOffer: null,
      mrp: Math.round(basePrice * 1.5),
    };
  }

  const numericId = typeof productId === "number" ? productId : parseInt(productId);

  // Find best matching offer:
  // 1. First priority: Specific product offer
  // 2. Second priority: Category offer
  // 3. Third priority: Sitewide offer
  let matchedOffer: ActiveOffer | null = null;

  for (const offer of activeOffers) {
    if (offer.scope === "PRODUCTS" && !isNaN(numericId) && offer.productIds.includes(numericId)) {
      matchedOffer = offer;
      break;
    }
  }

  if (!matchedOffer && category) {
    for (const offer of activeOffers) {
      if (offer.scope === "CATEGORY" && offer.targetCategory?.toLowerCase() === category.toLowerCase()) {
        matchedOffer = offer;
        break;
      }
    }
  }

  if (!matchedOffer) {
    for (const offer of activeOffers) {
      if (offer.scope === "SITEWIDE") {
        matchedOffer = offer;
        break;
      }
    }
  }

  if (!matchedOffer || matchedOffer.discountPercent <= 0) {
    return {
      price: basePrice,
      originalPrice: basePrice,
      discountPercent: 0,
      appliedOffer: null,
      mrp: Math.round(basePrice * 1.5),
    };
  }

  const discountAmount = (basePrice * matchedOffer.discountPercent) / 100;
  const finalPrice = Math.max(1, Math.round(basePrice - discountAmount));

  return {
    price: finalPrice,
    originalPrice: basePrice,
    discountPercent: Math.round(matchedOffer.discountPercent),
    appliedOffer: matchedOffer,
    mrp: Math.round(basePrice * 1.5),
  };
}
