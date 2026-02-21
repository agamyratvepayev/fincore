import { NextResponse } from "next/server";
import { defaultTenantIdForSession, encodeSession, sessionCookieName } from "../../../lib/auth/session";
import { findUser } from "../../../lib/auth/users";

export async function POST(request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const user = findUser(username);

  if (!user || user.password !== password) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), { status: 303 });
  }

  const session = {
    username: user.username,
    role: user.role,
    tenantIds: user.tenantIds
  };
  const tenantId = defaultTenantIdForSession(session);
  const response = NextResponse.redirect(new URL(`/${tenantId}`, request.url), { status: 303 });
  response.cookies.set(sessionCookieName(), encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
