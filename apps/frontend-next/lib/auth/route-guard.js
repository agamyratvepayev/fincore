import { cookies } from "next/headers";
import { decodeSession, sessionCookieName } from "./session";

export async function requireAdminSessionOrNull() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);
  if (!session || session.role !== "admin") return null;
  return session;
}
