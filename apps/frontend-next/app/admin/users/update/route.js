import { NextResponse } from "next/server";
import { updateUser } from "../../../../lib/auth/users";
import { requireAdminSessionOrNull } from "../../../../lib/auth/route-guard";

export async function POST(request) {
  const session = await requireAdminSessionOrNull();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  try {
    const form = await request.formData();
    const originalUsername = String(form.get("originalUsername") ?? "").trim();
    const username = String(form.get("username") ?? "").trim();
    const tenantIds = form.getAll("tenantIds").map((v) => String(v));

    updateUser(originalUsername, {
      username,
      password: String(form.get("password") ?? ""),
      role: String(form.get("role") ?? "viewer"),
      tenantIds,
      note: String(form.get("note") ?? "")
    });

    return NextResponse.redirect(new URL(`/admin/users?ok=update&edit=${encodeURIComponent(username)}`, request.url), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "update failed";
    return NextResponse.redirect(new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
  }
}
