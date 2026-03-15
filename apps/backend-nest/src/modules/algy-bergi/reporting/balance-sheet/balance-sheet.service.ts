import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { BalanceSheetRepository } from "./balance-sheet.repository.js";

export class BalanceSheetService {
  constructor(private readonly repository = new BalanceSheetRepository()) {}

  async dateFilters(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    const rows = await this.repository.fetchDateFilters();
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

  async execute(
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
  ): Promise<ReportResponse> {
    void filters?.client;
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const lines = await this.repository.getLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    return {
      tenantId,
      report: "balance-sheet",
      period,
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines
    };
  }

  async details(
    tenantId: string,
    filters?: {
      from?: string;
      to?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
      client?: string;
      code?: string;
      category?: string;
      offset?: number;
      limit?: number;
      kind?: "cash" | "material" | "credit" | "debit" | "bio" | "loan" | "advance" | "intangible" | "share";
    }
  ) {
    void filters?.client;
    void filters?.category;
    void filters?.kind;
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    return this.repository.getDetails(period, {
      code: filters?.code,
      offset: filters?.offset,
      limit: filters?.limit,
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
  }

  private emptyTotals(tenantId: string, report: string, filters?: { from?: string; to?: string }) {
    const period = buildReportPeriod(filters?.from, filters?.to);
    return {
      tenantId,
      report,
      period,
      totals: { totalTmt: 0, totalUsd: 0 },
      categories: []
    };
  }

  async materialTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-material-totals", filters);
  }

  async creditTotals(
    tenantId: string,
    filters?: { from?: string; to?: string; year?: number; month?: number; startDate?: string; endDate?: string }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getCreditLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
    return {
      tenantId,
      report: "balance-sheet-credit-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0),
        totalUsd: 0
      },
      categories: rows
    };
  }

  async debitTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-debit-totals", filters);
  }

  async bioTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-bio-totals", filters);
  }

  async loanTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-loan-totals", filters);
  }

  async advanceTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-advance-totals", filters);
  }

  async intangibleTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-intangible-totals", filters);
  }

  async shareTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-share-totals", filters);
  }
}
