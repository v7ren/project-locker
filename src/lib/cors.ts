import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Public site origin, e.g. `https://v7ren.xyz` — must match `Origin` header exactly. */
export function getConfiguredDomain(): string | undefined {
  const d = process.env.DOMAIN?.trim();
  return d && d.length > 0 ? d : undefined;
}

export function getAllowedApiOrigin(request: NextRequest): string | null {
  const domain = getConfiguredDomain();
  if (!domain) return null;
  const origin = request.headers.get("origin");
  if (!origin || origin !== domain) return null;
  return origin;
}

function applyCorsToResponse(request: NextRequest, response: NextResponse, origin: string): void {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  response.headers.set("Vary", "Origin");
  const reqHeaders = request.headers.get("Access-Control-Request-Headers");
  if (reqHeaders) {
    response.headers.set("Access-Control-Allow-Headers", reqHeaders);
  } else {
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

/** Attach CORS headers when `DOMAIN` matches the request `Origin` (for `/api/*` only). */
export function attachApiCorsIfAllowed(request: NextRequest, response: NextResponse): NextResponse {
  if (!request.nextUrl.pathname.startsWith("/api/")) return response;
  const origin = getAllowedApiOrigin(request);
  if (!origin) return response;
  applyCorsToResponse(request, response, origin);
  return response;
}

/**
 * Handle CORS preflight for `/api/*` when `DOMAIN` is set.
 * Returns a response to short-circuit middleware, or `undefined` to continue.
 */
export function maybeApiCorsPreflight(request: NextRequest): NextResponse | undefined {
  if (request.method !== "OPTIONS" || !request.nextUrl.pathname.startsWith("/api/")) {
    return undefined;
  }
  const domain = getConfiguredDomain();
  if (!domain) {
    return undefined;
  }
  const origin = request.headers.get("origin");
  if (origin !== domain) {
    return new NextResponse(null, { status: 403 });
  }
  const res = new NextResponse(null, { status: 204 });
  applyCorsToResponse(request, res, origin);
  return res;
}
