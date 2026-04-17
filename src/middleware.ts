import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthEnvConfig } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { readSessionFromTokenValue } from "@/lib/auth/session";
import { attachApiCorsIfAllowed, maybeApiCorsPreflight } from "@/lib/cors";

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
  if (isPublicViewerPath(pathname)) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (!getAuthEnvConfig()) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }

  if (pathname.startsWith("/login")) {
    return attachApiCorsIfAllowed(request, NextResponse.next());
  }
  if (pathname.startsWith("/api/auth/send-otp") || pathname.startsWith("/api/auth/verify-otp")) {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
