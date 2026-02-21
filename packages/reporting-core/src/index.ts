import { getMssqlConnection } from "@fincore/db-mssql/src/client.js";
import { pgPool } from "@fincore/db-postgres/src/client.js";

type RunReportInput = {
  tenantId: string;
};

export async function runTenantReport(input: RunReportInput) {
  const mssql = await getMssqlConnection();
  const mssqlHealth = await mssql.request().query("SELECT 1 AS ok");
  const pgHealth = await pgPool.query("SELECT 1 AS ok");

  return {
    tenantId: input.tenantId,
    mssql: mssqlHealth.recordset[0]?.ok === 1 ? "ok" : "unknown",
    postgres: pgHealth.rows[0]?.ok === 1 ? "ok" : "unknown"
  };
}
