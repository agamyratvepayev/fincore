import { NextResponse } from "next/server";
import { findUser, upsertUser } from "../../../../lib/auth/users";
import { requireAdminSessionOrNull } from "../../../../lib/auth/route-guard";

export async function POST(request) {
  const session = await requireAdminSessionOrNull();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  try {
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim();
    if (findUser(username)) {
      throw new Error("username already exists");
    }
    const tenantValues = form.getAll("tenantIds").map((v) => String(v));
    upsertUser({
      username,
      password: String(form.get("password") ?? ""),
      role: String(form.get("role") ?? "viewer"),
      tenantIds: tenantValues,
      note: String(form.get("note") ?? "")
    });
    return NextResponse.redirect(new URL("/admin/users?ok=create", request.url), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "create failed";
    return NextResponse.redirect(new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
  }
}
