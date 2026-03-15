import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";

export class IncomeStatementService {
  async execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse> {
    await ensureReportingTenantReady(tenantId);
    return {
      tenantId,
      report: "income-statement",
      period: buildReportPeriod(from, to),
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines: []
    };
  }

  async dateFilters(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    return { years: [], months: [], minStartDate: null, maxEndDate: null };
  }

  async clients(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    return [];
  }

  async revenueTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period: buildReportPeriod(filters?.from, filters?.to),
      totals: { totalTmt: 0, totalUsd: 0 },
      categories: []
    };
  }

  async expenseTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return {
      tenantId,
      report: "income-statement-expense-totals",
      period: buildReportPeriod(filters?.from, filters?.to),
      totals: { totalTmt: 0, totalUsd: 0 },
      categories: []
    };
  }

  async balanceTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return {
      tenantId,
      report: "income-statement-balance-totals",
      period: buildReportPeriod(filters?.from, filters?.to),
      totals: { totalTmt: 0, totalUsd: 0 },
      categories: []
    };
  }

  async details(
    tenantId: string,
    kind: "revenue" | "expense" | "balance",
    from?: string,
    to?: string,
    clientCode?: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string,
    category?: string,
    offset?: number,
    limit?: number
  ) {
    void kind;
    void clientCode;
    void year;
    void month;
    void startDate;
    void endDate;
    void category;
    await ensureReportingTenantReady(tenantId);
    return {
      tenantId,
      report: "income-statement-details",
      period: buildReportPeriod(from, to),
      paging: { offset: offset ?? 0, limit: limit ?? 50 },
      rows: []
    };
  }
}
