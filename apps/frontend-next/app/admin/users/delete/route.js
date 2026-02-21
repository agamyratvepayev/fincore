import { NextResponse } from "next/server";
import { deleteUser, findUser, readUsers } from "../../../../lib/auth/users";
import { requireAdminSessionOrNull } from "../../../../lib/auth/route-guard";

export async function POST(request) {
  const session = await requireAdminSessionOrNull();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const target = findUser(username);
  const users = readUsers();
  const adminCount = users.filter((u) => u.role === "admin").length;

  // Prevent locking out admin access by deleting the last admin.
  if (target?.role === "admin" && adminCount <= 1) {
    return NextResponse.redirect(new URL("/admin/users?error=cannot%20delete%20last%20admin", request.url), { status: 303 });
  }

  deleteUser(username);
  return NextResponse.redirect(new URL("/admin/users?ok=delete", request.url), { status: 303 });
}
