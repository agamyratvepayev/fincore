import { NextResponse } from "next/server";
import { sessionCookieName } from "../../lib/auth/session";

export async function GET(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(sessionCookieName(), "", { maxAge: 0, path: "/" });
  return response;
}
