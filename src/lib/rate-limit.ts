import { NextRequest } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitEntry>();
globalForRateLimit.rateLimitStore = store;

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  return "127.0.0.1";
}

export interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  clientIp: string;
  headers: Record<string, string>;
}

export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const clientIp = getClientIp(req);
  const key = `${options.keyPrefix}:${clientIp}`;
  const now = Date.now();

  // Periodic cleanup when map grows large
  if (store.size > 2000) {
    for (const [k, v] of store.entries()) {
      const active = v.timestamps.filter((t) => now - t < options.windowMs);
      if (active.length === 0 && (!v.blockedUntil || v.blockedUntil < now)) {
        store.delete(k);
      }
    }
  }

  const entry = store.get(key) || { timestamps: [] };

  // 1. Check active lockout block
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      clientIp,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(options.maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    };
  }

  // 2. Filter timestamps within current sliding window
  const validTimestamps = entry.timestamps.filter((t) => now - t < options.windowMs);

  if (validTimestamps.length >= options.maxRequests) {
    const blockDuration = options.blockDurationMs ?? options.windowMs;
    const blockedUntil = now + blockDuration;
    store.set(key, {
      timestamps: validTimestamps,
      blockedUntil,
    });

    const retryAfterSeconds = Math.max(1, Math.ceil(blockDuration / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      clientIp,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(options.maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    };
  }

  validTimestamps.push(now);
  store.set(key, {
    timestamps: validTimestamps,
    blockedUntil: undefined,
  });

  const remaining = Math.max(0, options.maxRequests - validTimestamps.length);
  return {
    allowed: true,
    remaining,
    retryAfterSeconds: 0,
    clientIp,
    headers: {
      "X-RateLimit-Limit": String(options.maxRequests),
      "X-RateLimit-Remaining": String(remaining),
    },
  };
}

export function resetRateLimit(req: NextRequest, keyPrefix: string): void {
  const clientIp = getClientIp(req);
  store.delete(`${keyPrefix}:${clientIp}`);
}

