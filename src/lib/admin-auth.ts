import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "./prisma";

export const ADMIN_USERNAME = "admin";
const INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || "Babybloom@2026";
const HASH_SALT = process.env.ADMIN_AUTH_SALT || "babybloom-admin-salt-2026-v1";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "babybloom-session-secret-key-2026";
export const ADMIN_COOKIE_NAME = "babybloom_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let authTableEnsured = false;

export function hashPassword(plainPassword: string): string {
  return crypto
    .createHmac("sha256", HASH_SALT)
    .update(plainPassword)
    .digest("hex");
}

async function ensureAdminAuthTable(): Promise<void> {
  if (authTableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminCredential" (
        "id" INTEGER PRIMARY KEY DEFAULT 1,
        "username" TEXT NOT NULL DEFAULT 'admin',
        "passwordHash" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const defaultHash = hashPassword(INITIAL_PASSWORD);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AdminCredential" ("id", "username", "passwordHash")
       VALUES (1, $1, $2)
       ON CONFLICT ("id") DO NOTHING;`,
      ADMIN_USERNAME,
      defaultHash
    );
    authTableEnsured = true;
  } catch (err) {
    console.warn("Could not ensure AdminCredential table, falling back to default hash:", err);
  }
}

export async function getStoredAdminCredential(): Promise<{
  username: string;
  passwordHash: string;
}> {
  try {
    await ensureAdminAuthTable();
    const rows = await prisma.$queryRawUnsafe<
      Array<{ username: string; passwordHash: string }>
    >(`SELECT "username", "passwordHash" FROM "AdminCredential" WHERE "id" = 1 LIMIT 1;`);

    if (rows && rows.length > 0 && rows[0].passwordHash) {
      return {
        username: rows[0].username || ADMIN_USERNAME,
        passwordHash: rows[0].passwordHash,
      };
    }
  } catch (err) {
    console.warn("Fallback to initial admin credential:", err);
  }

  return {
    username: ADMIN_USERNAME,
    passwordHash: hashPassword(INITIAL_PASSWORD),
  };
}

export async function verifyAdminCredentials(
  inputUsername: string,
  inputPassword: string
): Promise<boolean> {
  const cred = await getStoredAdminCredential();
  const normalizedInputUser = inputUsername.trim().toLowerCase();
  const normalizedExpectedUser = cred.username.trim().toLowerCase();

  if (normalizedInputUser !== normalizedExpectedUser) {
    return false;
  }

  const inputHash = hashPassword(inputPassword);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(cred.passwordHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(passwordHash: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${ADMIN_USERNAME}:${passwordHash.slice(0, 16)}:${exp}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;
    if (!encodedPayload || !signature) return false;

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const sigBufA = Buffer.from(signature, "hex");
    const sigBufB = Buffer.from(expectedSig, "hex");
    if (sigBufA.length !== sigBufB.length || !crypto.timingSafeEqual(sigBufA, sigBufB)) {
      return false;
    }

    const [userPart, pwdPart, expPart] = payload.split(":");
    if (!userPart || !pwdPart || !expPart) return false;

    const expTime = Number(expPart);
    if (!Number.isFinite(expTime) || Date.now() > expTime) {
      return false; // Token expired
    }

    const cred = await getStoredAdminCredential();
    return userPart === ADMIN_USERNAME && pwdPart === cred.passwordHash.slice(0, 16);
  } catch {
    return false;
  }
}

export async function requireAdminAuth(): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySessionToken(token);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authentication required." },
        { status: 401 }
      );
    }
    return null;
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Admin authentication required." },
      { status: 401 }
    );
  }
}

export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; newPasswordHash?: string }> {
  const isValid = await verifyAdminCredentials(ADMIN_USERNAME, currentPassword);
  if (!isValid) {
    return { success: false, error: "Current password is incorrect." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  await ensureAdminAuthTable();
  const newHash = hashPassword(newPassword);

  await prisma.$executeRawUnsafe(
    `UPDATE "AdminCredential" SET "passwordHash" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 1;`,
    newHash
  );

  return { success: true, newPasswordHash: newHash };
}

