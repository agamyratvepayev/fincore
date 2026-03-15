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
    const rows = await this.repository.getDateFilters();
    const dates = rows
      .map((row) => {
        const value = row.DATE_ ?? row.date_ ?? row.date ?? Object.values(row)[0];
        if (!value) return null;
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      })
      .filter((item): item is Date => item !== null)
      .sort((a, b) => a.getTime() - b.getTime());
    const years = Array.from(new Set(dates.map((d) => d.getUTCFullYear()))).sort((a, b) => b - a);
    const months = Array.from(new Set(dates.map((d) => d.getUTCMonth() + 1))).sort((a, b) => a - b);
    const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

    return {
      years,
      months,
      minStartDate: dates.length ? toIsoDate(dates[0]) : null,
      maxEndDate: dates.length ? toIsoDate(dates[dates.length - 1]) : null
    };
  }

  async clients(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    return [];
  }

  async revenueTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getRevenueTotals({
      year: (filters as { year?: number } | undefined)?.year,
      month: (filters as { month?: number } | undefined)?.month,
      startDate: (filters as { startDate?: string } | undefined)?.startDate,
      endDate: (filters as { endDate?: string } | undefined)?.endDate
    });
    const grouped = aggregateTotals(rows);
    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period,
      totals: {
        totalTmt: grouped.reduce((acc, row) => acc + row.lineNet, 0),
        totalUsd: grouped.reduce((acc, row) => acc + row.reportNet, 0)
      },
      categories: grouped.map((row) => ({
        id: row.code,
        name: row.definition,
        lineNet: row.lineNet,
        reportNet: row.reportNet,
        clients: row.clients
      }))
    };
  }

  async expenseTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getExpenseTotals({
      year: (filters as { year?: number } | undefined)?.year,
      month: (filters as { month?: number } | undefined)?.month,
      startDate: (filters as { startDate?: string } | undefined)?.startDate,
      endDate: (filters as { endDate?: string } | undefined)?.endDate
    });
    const grouped = aggregateTotals(rows);
    return {
      tenantId,
      report: "income-statement-expense-totals",
      period,
      totals: {
        totalTmt: grouped.reduce((acc, row) => acc + row.lineNet, 0),
        totalUsd: grouped.reduce((acc, row) => acc + row.reportNet, 0)
      },
      categories: grouped.map((row) => ({
        id: row.code,
        name: row.definition,
        lineNet: row.lineNet,
        reportNet: row.reportNet,
        clients: row.clients
      }))
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
    await ensureReportingTenantReady(tenantId);
    const code = String(category ?? "").trim();
    const rows =
      kind === "expense"
        ? await this.repository.getExpenseDetails({
            code,
            clcode: clientCode,
            offset: offset ?? 0,
            limit: limit ?? 50,
            year,
            month,
            startDate,
            endDate
          })
        : await this.repository.getRevenueDetails({
            code,
            clcode: clientCode,
            offset: offset ?? 0,
            limit: limit ?? 50,
            year,
            month,
            startDate,
            endDate
          });
    return {
      tenantId,
      report: kind === "expense" ? "income-statement-expense-details" : "income-statement-revenue-details",
      period: buildReportPeriod(from, to),
      paging: { offset: offset ?? 0, limit: limit ?? 50 },
      rows
    };
  }
}

function aggregateTotals(
  rows: Array<{ code: string; definition: string; clcode: string; client: string; lineNet: number; reportNet: number }>
) {
  const grouped = new Map<
    string,
    {
      code: string;
      definition: string;
      lineNet: number;
      reportNet: number;
      clients: Array<{ clcode: string; client: string; lineNet: number; reportNet: number }>;
    }
  >();
  for (const row of rows) {
    const key = row.code || row.definition;
    const current = grouped.get(key) ?? { code: row.code, definition: row.definition, lineNet: 0, reportNet: 0, clients: [] };
    current.lineNet += row.lineNet;
    current.reportNet += row.reportNet;
    current.clients.push({
      clcode: row.clcode,
      client: row.client,
      lineNet: row.lineNet,
      reportNet: row.reportNet
    });
    grouped.set(key, current);
  }
  return Array.from(grouped.values());
}
