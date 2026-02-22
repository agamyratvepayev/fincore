import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, hasTenantAccess, sessionCookieName } from "../../../../lib/auth/session";
import { deleteTodo, findTodo } from "../../../../lib/todos/store";

export async function POST(request, context) {
  const { tenantId } = await context.params;
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);

  if (!session || session.role !== "admin" || !hasTenantAccess(session, tenantId)) {
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=forbidden`, request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const current = findTodo(id);
  if (!current || current.tenantId !== tenantId) {
    return NextResponse.redirect(new URL(`/${tenantId}/todos?error=todo%20not%20found`, request.url), { status: 303 });
  }

  deleteTodo(id);
  return NextResponse.redirect(new URL(`/${tenantId}/todos?ok=removed`, request.url), { status: 303 });
}
