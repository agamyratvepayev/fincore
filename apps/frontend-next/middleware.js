import { NextResponse } from "next/server";
import { decodeSession, defaultTenantIdForSession, hasTenantAccess, sessionCookieName } from "./lib/auth/session";

function redirectToLogin(request) {
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname === "/login" ||
    pathname.startsWith("/auth/login") ||
    pathname === "/logout" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(sessionCookieName())?.value;
  const session = decodeSession(raw);
  if (!session) return redirectToLogin(request);
  const fallbackTenantId = defaultTenantIdForSession(session);
  const fallbackTenantUrl = new URL(`/${fallbackTenantId}`, request.url);

  if (pathname.startsWith("/admin/users")) {
    if (session.role !== "admin") {
      return NextResponse.redirect(fallbackTenantUrl);
    }
    return NextResponse.next();
  }

  const tenantMatch = pathname.match(/^\/([^/]+)(\/|$)/);
  if (tenantMatch) {
    const tenantId = tenantMatch[1];
    if (!hasTenantAccess(session, tenantId)) {
      return NextResponse.redirect(fallbackTenantUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};
