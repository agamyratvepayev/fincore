import { NextResponse } from "next/server";
import { defaultTenantIdForSession, encodeSession, sessionCookieName } from "../../../lib/auth/session";
import { findUser } from "../../../lib/auth/users";

export async function POST(request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const user = findUser(username);

  if (!user || user.password !== password) {
    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: "/login?error=1"
      }
    });
  }

  const session = {
    username: user.username,
    role: user.role,
    tenantIds: user.tenantIds
  };
  const tenantId = defaultTenantIdForSession(session);
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/${tenantId}`
    }
  });
  response.cookies.set(sessionCookieName(), encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
