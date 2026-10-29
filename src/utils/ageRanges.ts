// Pure client & server safe utilities for parsing and sorting baby/kids age ranges in ascending order

export function parseAgeRangeSortKey(name: string): { tier: number; startMonths: number; endMonths: number } {
  const clean = (name || "").toLowerCase().trim();
  if (clean.includes("newborn")) return { tier: 0, startMonths: 0, endMonths: 3 };

  // Months format: "0-3 Months", "6-12 Months"
  const mMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:month|months|m\b)/i);
  if (mMatch) {
    const start = parseFloat(mMatch[1]);
    const end = mMatch[2] ? parseFloat(mMatch[2]) : start;
    return { tier: 0, startMonths: start, endMonths: end };
  }

  // Years format: "0-1 Yrs", "1-4 Yrs", "2-3 Years"
  const yMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:yr|yrs|year|years|y\b)/i);
  if (yMatch) {
    const start = parseFloat(yMatch[1]) * 12;
    const end = (yMatch[2] ? parseFloat(yMatch[2]) : parseFloat(yMatch[1])) * 12;
    return { tier: 1, startMonths: start, endMonths: end };
  }

  // Generic numbers: "1-4"
  const genMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?/);
  if (genMatch && genMatch[1]) {
    const start = parseFloat(genMatch[1]) * 12;
    const end = (genMatch[2] ? parseFloat(genMatch[2]) : parseFloat(genMatch[1])) * 12;
    return { tier: 1, startMonths: start, endMonths: end };
  }

  return { tier: 2, startMonths: 9999, endMonths: 9999 };
}

export function compareAgeRanges(a: { name: string } | string, b: { name: string } | string): number {
  const nameA = typeof a === "string" ? a : a?.name || "";
  const nameB = typeof b === "string" ? b : b?.name || "";
  const kA = parseAgeRangeSortKey(nameA);
  const kB = parseAgeRangeSortKey(nameB);
  if (kA.tier !== kB.tier) return kA.tier - kB.tier;
  if (kA.startMonths !== kB.startMonths) return kA.startMonths - kB.startMonths;
  if (kA.endMonths !== kB.endMonths) return kA.endMonths - kB.endMonths;
  return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
}

export function sortAgeRanges<T extends { name: string } | string>(items: T[]): T[] {
  return [...items].sort((a, b) => compareAgeRanges(a, b));
}
