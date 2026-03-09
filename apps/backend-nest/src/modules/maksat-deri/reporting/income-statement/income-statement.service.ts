import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { IncomeStatementRepository } from "./income-statement.repository.js";

export class IncomeStatementService {
  constructor(private readonly repository = new IncomeStatementRepository()) {}

  async execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse> {
    const totals = await this.revenueTotals(tenantId, { from, to });
    return {
      tenantId,
      report: "income-statement",
      period: totals.period,
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines: [{ code: "REV", label: "Revenue", amount: Number(totals.totals?.totalTmt ?? 0) }]
    };
  }

  async dateFilters(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    return {
      years: [],
      months: [],
      minStartDate: null,
      maxEndDate: null
    };
  }

  async clients(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    return [];
  }

  async revenueTotals(
    tenantId: string,
    filters?: { from?: string; to?: string; year?: number; month?: number; startDate?: string; endDate?: string }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getRevenueTotals({
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows.map((row) => ({
        id: row.id,
        name: row.category,
        lineNet: row.lineNet,
        reportNet: row.reportNet
      }))
    };
  }

  async expenseTotals(
    tenantId: string,
    filters?: { from?: string; to?: string; year?: number; month?: number; startDate?: string; endDate?: string }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getExpenseTotals({
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
    return {
      tenantId,
      report: "income-statement-expense-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows.map((row) => ({
        id: row.id,
        name: row.category,
        lineNet: row.lineNet,
        reportNet: row.reportNet
      }))
    };
  }

  async balanceTotals(
    tenantId: string,
    filters?: { from?: string; to?: string; year?: number; month?: number; startDate?: string; endDate?: string }
  ) {
    void filters;
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    return {
      tenantId,
      report: "income-statement-balance-totals",
      period,
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
    void clientCode;
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);
    if (kind === "revenue") {
      const parsedCategoryRaw = category == null || String(category).trim() === "" ? undefined : String(category).trim();
      const parsedCategory = parsedCategoryRaw != null ? Number(parsedCategoryRaw) : undefined;
      const validId = Number.isFinite(parsedCategory) ? Number(parsedCategory) : 2;
      const rows = await this.repository.getRevenueDetails({
        id: validId,
        offset: offset ?? 0,
        limit: limit ?? 50,
        year,
        month,
        startDate,
        endDate
      });
      return {
        tenantId,
        report: "income-statement-revenue-details",
        period,
        paging: { offset: offset ?? 0, limit: limit ?? 50 },
        rows
      };
    }
    if (kind === "expense") {
      const parsedCategoryRaw = category == null || String(category).trim() === "" ? undefined : String(category).trim();
      const parsedCategory = parsedCategoryRaw != null ? Number(parsedCategoryRaw) : undefined;
      const validId = Number.isFinite(parsedCategory) ? Number(parsedCategory) : 1;
      const rows = await this.repository.getExpenseDetails({
        id: validId,
        offset: offset ?? 0,
        limit: limit ?? 50,
        year,
        month,
        startDate,
        endDate
      });
      return {
        tenantId,
        report: "income-statement-expense-details",
        period,
        paging: { offset: offset ?? 0, limit: limit ?? 50 },
        rows
      };
    }
    return {
      tenantId,
      report: "income-statement-details",
      period,
      paging: { offset: offset ?? 0, limit: limit ?? 50 },
      rows: []
    };
  }
}
