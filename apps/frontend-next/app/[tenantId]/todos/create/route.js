import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, hasTenantAccess, sessionCookieName } from "../../../../lib/auth/session";
import { createTodo } from "../../../../lib/todos/store";

export async function POST(request, context) {
  const { tenantId } = await context.params;
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);

  if (!session || session.role !== "admin" || !hasTenantAccess(session, tenantId)) {
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=forbidden`, request.url), { status: 303 });
  }

  try {
    const form = await request.formData();
    createTodo({
      tenantId,
      jobName: String(form.get("jobName") ?? ""),
      jobDescription: String(form.get("jobDescription") ?? ""),
      deadline: String(form.get("deadline") ?? ""),
      note: String(form.get("note") ?? ""),
      state: String(form.get("state") ?? "Pending")
    });
    return NextResponse.redirect(new URL(`/${tenantId}/todos?ok=created`, request.url), { status: 303 });
  } catch (error) {
    const message = encodeURIComponent((error instanceof Error ? error.message : "failed").toLowerCase());
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=${message}`, request.url), { status: 303 });
  }
}
