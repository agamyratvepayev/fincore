const SESSION_COOKIE = "fincore_session";

export function sessionCookieName() {
  return SESSION_COOKIE;
}

export function encodeSession(payload) {
  const json = JSON.stringify(payload ?? {});
  return encodeURIComponent(json);
}

export function decodeSession(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || !parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasTenantAccess(session, tenantId) {
  if (!session) return false;
  if (session.role === "admin" || session.role === "manager") return true;
  const ids = Array.isArray(session.tenantIds) ? session.tenantIds : [];
  return ids.includes(tenantId);
}

export function defaultTenantIdForSession(session) {
  if (!session) return "gurlusyk";
  if (session.role === "admin" || session.role === "manager") return "gurlusyk";
  const ids = Array.isArray(session.tenantIds) ? session.tenantIds : [];
  return ids[0] || "gurlusyk";
}
