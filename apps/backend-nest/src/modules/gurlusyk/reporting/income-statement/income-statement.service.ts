import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { getDefaultClientCode } from "../../../../shared/reporting/reporting.constants.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { IncomeStatementRepository } from "./income-statement.repository.js";

export class IncomeStatementService {
  constructor(private readonly repository = new IncomeStatementRepository()) {}

  async execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse> {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);
    const [revenueRows, expenseRows] = await Promise.all([
      this.repository.getRevenueTotals(period, undefined, getDefaultClientCode(tenantId)),
      this.repository.getExpenseTotals(period, undefined, getDefaultClientCode(tenantId))
    ]);

    const sum = <T>(items: T[], selector: (item: T) => number) =>
      items.reduce((acc, item) => acc + selector(item), 0);

    return {
      tenantId,
      report: "income-statement",
      period,
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines: [
        {
          code: "REV",
          label: "Revenue",
          amount: sum(revenueRows, (row) => row.lineNet)
        },
        {
          code: "EXP",
          label: "Expenses",
          amount: sum(expenseRows, (row) => row.lineNet)
        }
      ]
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
    const filterOverrides = {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    };
    const clientCode = filters?.client || getDefaultClientCode(tenantId);
    const [rows, expenseRows] = await Promise.all([
      this.repository.getRevenueTotals(period, filterOverrides, clientCode),
      this.repository.getExpenseTotals(period, filterOverrides, clientCode)
    ]);

    const sum = <T>(items: T[], selector: (item: T) => number) =>
      items.reduce((acc, item) => acc + selector(item), 0);

    const revenueTotalTmt = sum(rows, (row) => row.lineNet);
    const revenueTotalUsd = sum(rows, (row) => row.reportNet);
    const expenseTotalTmt = sum(expenseRows, (row) => row.lineNet);
    const expenseTotalUsd = sum(expenseRows, (row) => row.reportNet);

    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period,
      totals: {
        revenueTotalTmt,
        revenueTotalUsd,
        expenseTotalTmt,
        expenseTotalUsd,
        peydaTotalTmt: revenueTotalTmt - expenseTotalTmt,
        peydaTotalUsd: revenueTotalUsd - expenseTotalUsd,
        satyslarTmt: 0,
        satyslarUsd: 0,
        gymmatyTmt: 0,
        gymmatyUsd: 0,
        hyzmatlarTmt: 0,
        hyzmatlarUsd: 0
      },
      revenueByCategory: rows.map((row) => ({
        id: row.id || "",
        name: row.name || row.group || "Category",
        tmt: row.lineNet,
        usd: row.reportNet
      })),
      expenseByDefinition: expenseRows.map((row) => ({
        id: row.id || "",
        name: row.name || "",
        definition: row.definition,
        tmt: row.lineNet,
        usd: row.reportNet
      }))
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
    category = "ALL",
    offset = 0,
    limit = 50
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);
    const detail = { category, offset, limit };
    const overrides = {
      year,
      month,
      startDate: startDate ?? from,
      endDate: endDate ?? to
    };
    const code = clientCode || getDefaultClientCode(tenantId);

    if (kind === "revenue") return this.repository.getRevenueDetails(period, detail, overrides, code);
    return this.repository.getExpenseDetails(period, detail, overrides, code);
  }
}
