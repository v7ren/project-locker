import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { readSessionFromTokenValue } from "@/lib/auth/session";
import { attachApiCorsIfAllowed, maybeApiCorsPreflight } from "@/lib/cors";

/** Tab / metadata fetches must not hit the login redirect (cookies can be missing or SVG unsupported). */
function isPublicAssetPath(pathname: string): boolean {
  if (pathname === "/icon" || pathname === "/apple-icon") return true;
  if (pathname === "/favicon.ico" || pathname === "/favicon.svg") return true;
  if (/^\/[^/]+\.(?:ico|svg|png|jpg|jpeg|gif|webp)$/i.test(pathname)) return true;
  return false;
}

function isPublicViewerPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  if (parts[1] !== "public") return false;
  const reserved = new Set(["api", "login", "docs"]);
  if (reserved.has(parts[0]!)) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const preflight = maybeApiCorsPreflight(request);
  if (preflight !== undefined) {
    return preflight;
  }

  const { pathname } = request.nextUrl;
  if (isPublicAssetPath(pathname)) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (isPublicViewerPath(pathname)) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (getAuthGateMode() === "none") {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (pathname.startsWith("/login")) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }
  if (
    pathname.startsWith("/api/auth/send-otp") ||
    pathname.startsWith("/api/auth/verify-otp") ||
    pathname.startsWith("/api/auth/register-request") ||
    pathname.startsWith("/api/auth/key-login") ||
    pathname.startsWith("/api/auth/username/") ||
    pathname.startsWith("/api/auth/backup-login") ||
    pathname.startsWith("/api/auth/admin-access-login") ||
    pathname.startsWith("/api/auth/invite/redeem") ||
    pathname.startsWith("/api/auth/redeem")
  ) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await readSessionFromTokenValue(token);
  if (session) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (pathname.startsWith("/api/")) {
    return attachApiCorsIfAllowed(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const nextPath = pathname + request.nextUrl.search;
  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    url.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
