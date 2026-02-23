import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { getDefaultClientCode } from "../../../../shared/reporting/reporting.constants.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { IncomeStatementRepository } from "./income-statement.repository.js";

export class IncomeStatementService {
  constructor(private readonly repository = new IncomeStatementRepository()) {}

  async execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse> {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);
    const rows = await this.repository.getRevenueTotals(tenantId, period, undefined, getDefaultClientCode(tenantId));

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
    const rows = await this.repository.getDateFilters(tenantId);

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
    if (isAgroTenant(tenantId)) return [];
    const rows = await this.repository.getClientNames(tenantId);
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
      tenantId,
      period,
      {
        year: filters?.year,
        month: filters?.month,
        startDate: filters?.startDate,
        endDate: filters?.endDate
      },
      filters?.client || getDefaultClientCode(tenantId)
    );

    if (isAgroTenant(tenantId)) {
      const satyslar = rows.find((row) => String(row.name).toUpperCase() === "SATYSLAR");
      const hyzmatlar = rows.find((row) => String(row.name).toUpperCase() === "HYZMATLAR");

      const satyslarLineNet = Number(satyslar?.lineNet ?? 0);
      const satyslarReportNet = Number(satyslar?.reportNet ?? 0);
      const gymmatyLineNet = -Number(satyslar?.outCost ?? 0);
      const gymmatyReportNet = -Number(satyslar?.outCostCurr ?? 0);
      const hyzmatlarLineNet = Number(hyzmatlar?.lineNet ?? 0);
      const hyzmatlarReportNet = Number(hyzmatlar?.reportNet ?? 0);

      const agroCategories = [
        { id: 0, name: "Satyslar", lineNet: satyslarLineNet, reportNet: satyslarReportNet },
        {
          id: "GYMMATY",
          name: "Gymmaty",
          lineNet: gymmatyLineNet,
          reportNet: gymmatyReportNet,
          disableDetails: true
        },
        { id: 4, name: "Hyzmatlar", lineNet: hyzmatlarLineNet, reportNet: hyzmatlarReportNet }
      ];
      return {
        tenantId,
        report: "income-statement-revenue-totals",
        period,
        totals: {
          totalTmt: satyslarLineNet + gymmatyLineNet + hyzmatlarLineNet,
          totalUsd: satyslarReportNet + gymmatyReportNet + hyzmatlarReportNet
        },
        categories: agroCategories
      };
    }

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
      tenantId,
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

  async balanceTotals(
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
    const rows = await this.repository.getBalanceTotals(
      tenantId,
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
      report: "income-statement-balance-totals",
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
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(from, to);

    const parsedCategoryRaw = category == null || String(category).trim() === "" ? undefined : String(category).trim();
    const parsedCategory = parsedCategoryRaw != null ? Number(parsedCategoryRaw) : undefined;

    const detailParams = {
      category:
        Number.isFinite(parsedCategory) && (isAgroTenant(tenantId) ? parsedCategory === 0 || parsedCategory === 4 : true)
          ? parsedCategory
          : undefined,
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
        ? await this.repository.getExpenseDetails(tenantId, period, detailParams, selectedClientCode)
        : kind === "balance"
          ? await this.repository.getBalanceDetails(tenantId, period, detailParams, selectedClientCode)
          : await this.repository.getRevenueDetails(tenantId, period, detailParams, selectedClientCode);

    return {
      tenantId,
      report:
        kind === "expense"
          ? "income-statement-expense-details"
          : kind === "balance"
            ? "income-statement-balance-details"
            : "income-statement-revenue-details",
      period,
      paging: {
        offset: offset ?? 0,
        limit: limit ?? 50
      },
      rows
    };
  }
}

function isAgroTenant(tenantId: string) {
  return String(tenantId).toLowerCase() === "agro";
}
