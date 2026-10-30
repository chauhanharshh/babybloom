import { PrismaClient } from "@prisma/client";

function getEnhancedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Render & external PostgreSQL connections require SSL and benefit from connect/pool timeouts
  if (url.includes("render.com") || url.includes("postgres")) {
    let enhanced = url;
    if (!enhanced.includes("sslmode=")) {
      enhanced += (enhanced.includes("?") ? "&" : "?") + "sslmode=require";
    }
    if (!enhanced.includes("connect_timeout=")) {
      enhanced += (enhanced.includes("?") ? "&" : "?") + "connect_timeout=30";
    }
    if (!enhanced.includes("pool_timeout=")) {
      enhanced += (enhanced.includes("?") ? "&" : "?") + "pool_timeout=30";
    }
    if (!enhanced.includes("connection_limit=")) {
      enhanced += (enhanced.includes("?") ? "&" : "?") + "connection_limit=5";
    }
    return enhanced;
  }
  return url;
}

const prismaClientSingleton = () => {
  const dbUrl = getEnhancedDatabaseUrl();
  return new PrismaClient(
    dbUrl
      ? {
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        }
      : undefined
  );
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const getPrisma = () => {
  const existing = (globalThis as unknown as { prismaGlobal?: PrismaClient }).prismaGlobal;
  if (
    existing &&
    (existing as unknown as { banner?: unknown }).banner &&
    (existing as unknown as { offer?: unknown }).offer &&
    (existing as unknown as { ageRange?: unknown }).ageRange &&
    (existing as unknown as { invoice?: unknown }).invoice
  ) {
    return existing;
  }
  const fresh = prismaClientSingleton();
  (globalThis as unknown as { prismaGlobal?: PrismaClient }).prismaGlobal = fresh;
  return fresh;
};

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma() as any;
    return client[prop];
  },
});

export default prisma;


