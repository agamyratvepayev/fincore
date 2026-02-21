import { getTenantById, tenantHasFeature } from "@fincore/tenant-core";
import { pgPool } from "@fincore/db-postgres/src/client.js";
import type { ReportPeriod } from "./reporting.types.js";

export function buildReportPeriod(from?: string, to?: string): ReportPeriod {
  const now = new Date();
  const start = from ?? `${now.getUTCFullYear()}-01-01`;
  const end = to ?? now.toISOString().slice(0, 10);
  return { from: start, to: end };
}

export async function ensureReportingTenantReady(tenantId: string): Promise<void> {
  const tenant = getTenantById(tenantId);
  if (!tenant) throw new Error(`Tenant '${tenantId}' is not configured.`);

  if (!tenantHasFeature(tenantId, "reporting")) {
    throw new Error(`Reporting is disabled for tenant '${tenantId}'.`);
  }

  const result = await pgPool.query(
    "SELECT true AS enabled WHERE $1::text IS NOT NULL",
    [tenantId]
  );
  if (result.rows[0]?.enabled !== true) {
    throw new Error(`Tenant '${tenantId}' is not available in data layer.`);
  }
}
