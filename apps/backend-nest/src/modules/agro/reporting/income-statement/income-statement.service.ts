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
    const rows = await this.repository.getRevenueTotals({
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    const satyslar = rows.find((row) => row.category.toUpperCase() === "SATYSLAR");
    const hyzmatlar = rows.find((row) => row.category.toUpperCase() === "HYZMATLAR");

    const satyslarLineNet = Number(satyslar?.lineNet ?? 0);
    const satyslarReportNet = Number(satyslar?.reportNet ?? 0);
    const gymmatyLineNet = -Number(satyslar?.outCost ?? 0);
    const gymmatyReportNet = -Number(satyslar?.outCostCurr ?? 0);
    const hyzmatlarLineNet = Number(hyzmatlar?.lineNet ?? 0);
    const hyzmatlarReportNet = Number(hyzmatlar?.reportNet ?? 0);

    return {
      tenantId,
      report: "income-statement-revenue-totals",
      period,
      totals: {
        totalTmt: satyslarLineNet + gymmatyLineNet + hyzmatlarLineNet,
        totalUsd: satyslarReportNet + gymmatyReportNet + hyzmatlarReportNet
      },
      categories: [
        { id: 2, name: "Satyslar", lineNet: satyslarLineNet, reportNet: satyslarReportNet },
        { id: "GYMMATY", name: "Gymmaty", lineNet: gymmatyLineNet, reportNet: gymmatyReportNet },
        { id: 1, name: "Hyzmatlar", lineNet: hyzmatlarLineNet, reportNet: hyzmatlarReportNet }
      ]
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
    }
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

  async balanceTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    const period = buildReportPeriod(filters?.from, filters?.to);
    await ensureReportingTenantReady(tenantId);
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

    if (kind === "balance") {
      return {
        tenantId,
        report: "income-statement-balance-details",
        period,
        paging: { offset: offset ?? 0, limit: limit ?? 50 },
        rows: []
      };
    }

    const parsedCategoryRaw = category == null || String(category).trim() === "" ? undefined : String(category).trim();
    const isGymmaty = String(parsedCategoryRaw ?? "").toUpperCase() === "GYMMATY";
    const parsedCategory = parsedCategoryRaw != null ? Number(parsedCategoryRaw) : undefined;
    const validId = Number.isFinite(parsedCategory) ? Number(parsedCategory) : kind === "revenue" ? 2 : 1;

    const rows =
      kind === "expense"
        ? await this.repository.getExpenseDetails({
            id: validId,
            offset: offset ?? 0,
            limit: limit ?? 50,
            year,
            month,
            startDate,
            endDate
          })
        : await this.repository.getRevenueDetails({
            id: isGymmaty ? 2 : validId,
            offset,
            limit,
            year,
            month,
            startDate,
            endDate
          });
    const resultRows = isGymmaty
      ? rows.map((row) => ({
          ...row,
          CATEGORY: "GYMMATY",
          LINENET: -Number(row.OUTCOST ?? row.outcost ?? 0),
          REPORTNET: -Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
        }))
      : kind === "expense"
        ? rows.map((row) => {
            const groupValue = String(
              row.GROUP_ ?? row.group_ ?? row.GROUP ?? row.group ?? ""
            ).trim();
            return {
              ...row,
              GROUP: groupValue,
              GROUP_: groupValue
            };
          })
        : rows;

    return {
      tenantId,
      report: kind === "expense" ? "income-statement-expense-details" : "income-statement-revenue-details",
      period,
      paging: {
        offset: offset ?? 0,
        limit: limit ?? 50
      },
      rows: resultRows
    };
  }
}
