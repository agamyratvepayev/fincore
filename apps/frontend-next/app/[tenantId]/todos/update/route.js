import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, hasTenantAccess, sessionCookieName } from "../../../../lib/auth/session";
import { findTodo, updateTodo } from "../../../../lib/todos/store";

export async function POST(request, context) {
  const { tenantId } = await context.params;
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);

  const role = String(session?.role ?? "").toLowerCase();
  const canModify = role === "admin" || role === "manager";
  if (!session || !canModify || !hasTenantAccess(session, tenantId)) {
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=forbidden`, request.url), { status: 303 });
  }

  try {
    const form = await request.formData();
    const id = String(form.get("id") ?? "");
    const current = findTodo(id);
    if (!current || current.tenantId !== tenantId) {
      return NextResponse.redirect(new URL(`/${tenantId}/todos?error=todo%20not%20found`, request.url), { status: 303 });
    }

    updateTodo({
      id,
      jobName: String(form.get("jobName") ?? ""),
      jobDescription: String(form.get("jobDescription") ?? ""),
      deadline: String(form.get("deadline") ?? ""),
      note: String(form.get("note") ?? ""),
      state: String(form.get("state") ?? "Pending")
    });

    return NextResponse.redirect(new URL(`/${tenantId}/todos?ok=updated`, request.url), { status: 303 });
  } catch (error) {
    const message = encodeURIComponent((error instanceof Error ? error.message : "failed").toLowerCase());
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=${message}`, request.url), { status: 303 });
  }
}
