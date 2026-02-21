import { TENANTS } from "../../tenants";

export function resolveTenant(tenantId) {
  const key = String(tenantId || "").toLowerCase();
  const tenant = TENANTS.find((item) => item.id === key);
  if (!tenant) return null;
  return tenant;
}
