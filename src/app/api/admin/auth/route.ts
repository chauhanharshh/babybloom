import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_USERNAME,
  createSessionToken,
  getStoredAdminCredential,
  updateAdminPassword,
  verifyAdminCredentials,
  verifySessionToken,
} from "@/lib/admin-auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ADMIN_LOGIN_LIMIT = {
  keyPrefix: "admin_login",
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // 15 minutes lockout after 5 failed attempts
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySessionToken(token);

    return NextResponse.json(
      {
        authenticated: isAuthenticated,
        username: ADMIN_USERNAME,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch {
    return NextResponse.json({ authenticated: false, username: ADMIN_USERNAME }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, ADMIN_LOGIN_LIMIT);
    if (!rate.allowed) {
      const waitMins = Math.max(1, Math.ceil(rate.retryAfterSeconds / 60));
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Locked for ${waitMins} minute(s). Please try again later.`,
        },
        { status: 429, headers: rate.headers }
      );
    }

    const body = await req.json();
    const username = String(body?.username || ADMIN_USERNAME);
    const password = String(body?.password || "");

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Please enter the admin password." },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      const leftMsg =
        rate.remaining > 0
          ? ` (${rate.remaining} attempt${rate.remaining === 1 ? "" : "s"} remaining)`
          : " (Account locked for 15 minutes)";
      return NextResponse.json(
        { success: false, error: `Invalid username or password.${leftMsg}` },
        { status: 401, headers: rate.headers }
      );
    }

    // Clear failed login counter upon successful login
    resetRateLimit(req, ADMIN_LOGIN_LIMIT.keyPrefix);

    const cred = await getStoredAdminCredential();
    const sessionToken = createSessionToken(cred.passwordHash);

    const res = NextResponse.json({
      success: true,
      username: cred.username,
    });

    res.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, {
      keyPrefix: "admin_pwd_change",
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });
    if (!rate.allowed) {
      const waitMins = Math.max(1, Math.ceil(rate.retryAfterSeconds / 60));
      return NextResponse.json(
        {
          success: false,
          error: `Too many password change attempts. Please wait ${waitMins} minute(s).`,
        },
        { status: 429, headers: rate.headers }
      );
    }

    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySessionToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    const result = await updateAdminPassword(currentPassword, newPassword);
    if (!result.success || !result.newPasswordHash) {
      return NextResponse.json(
        { success: false, error: result.error || "Could not update password." },
        { status: 400 }
      );
    }

    const newSessionToken = createSessionToken(result.newPasswordHash);
    const res = NextResponse.json({
      success: true,
      message: "Admin password updated successfully!",
    });

    res.cookies.set(ADMIN_COOKIE_NAME, newSessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Admin password update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

