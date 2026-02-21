import { getTenantById } from "@fincore/tenant-core";

export function resolveTenantOrNull(tenantId: string) {
  return getTenantById(tenantId) ?? null;
}
