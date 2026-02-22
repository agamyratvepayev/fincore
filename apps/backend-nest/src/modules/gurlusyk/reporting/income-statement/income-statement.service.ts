import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { getDefaultClientCode } from "../../../../shared/reporting/reporting.constants.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { IncomeStatementRepository } from "./income-statement.repository.js";

export class IncomeStatementService {
  constructor(private readonly repository = new IncomeStatementRepository()) {}

  async execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse> {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);
    const rows = await this.repository.getRevenueTotals(period, undefined, getDefaultClientCode(tenantId));

    const revenueAmount = rows.reduce((acc, row) => acc + row.lineNet, 0);

    return {
      tenantId,
      report: "income-statement",
      period,
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines: [{ code: "REV", label: "Revenue", amount: revenueAmount }]
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
    const rows = await this.repository.getClientNames();
    return rows
      .map((row) => {
        const values = Object.values(row)
          .map((value) => String(value ?? "").trim())
          .filter(Boolean);
        const code = String(
          row.CODE ??
            row.code ??
            row.CODE_ ??
            row.code_ ??
            row.ADDR2 ??
            row.addr2 ??
            row.CLIENT ??
            row.client ??
            values[0] ??
            ""
        ).trim();
        const name = String(
          row.NAME ??
            row.name ??
            row.DEFINITION_ ??
            row.definition_ ??
            row.ADDR1 ??
            row.addr1 ??
            values[1] ??
            code
        ).trim();
        return { code, name: name || code };
      })
      .filter((row) => row.code);
  }

  async revenueTotals(
    tenantId: string,
    filters?: {
      from?: string;
      to?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
      client?: string;
    }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getRevenueTotals(
      period,
      {
        year: filters?.year,
        month: filters?.month,
        startDate: filters?.startDate,
        endDate: filters?.endDate
      },
      filters?.client || getDefaultClientCode(tenantId)
    );

    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + row.lineNet, 0),
        totalUsd: rows.reduce((acc, row) => acc + row.reportNet, 0)
      },
      categories: rows
    };
  }

  async expenseTotals(
    tenantId: string,
    filters?: {
      from?: string;
      to?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
      client?: string;
    }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getExpenseTotals(
      period,
      {
        year: filters?.year,
        month: filters?.month,
        startDate: filters?.startDate,
        endDate: filters?.endDate
      },
      filters?.client || getDefaultClientCode(tenantId)
    );

    return {
      tenantId,
      report: "income-statement-expense-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + row.lineNet, 0),
        totalUsd: rows.reduce((acc, row) => acc + row.reportNet, 0)
      },
      categories: rows
    };
  }

  async details(
    tenantId: string,
    kind: "revenue" | "expense",
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
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);

    const parsedCategory = category == null || String(category).trim() === "" ? undefined : Number(category);

    const detailParams = {
      category: Number.isFinite(parsedCategory) ? parsedCategory : undefined,
      offset,
      limit,
      year,
      month,
      startDate,
      endDate
    };
    const selectedClientCode = clientCode || getDefaultClientCode(tenantId);
    const rows =
      kind === "expense"
        ? await this.repository.getExpenseDetails(period, detailParams, selectedClientCode)
        : await this.repository.getRevenueDetails(period, detailParams, selectedClientCode);

    return {
      tenantId,
      report: kind === "expense" ? "income-statement-expense-details" : "income-statement-revenue-details",
      period,
      paging: {
        offset: offset ?? 0,
        limit: limit ?? 50
      },
      rows
    };
  }
}
