import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { BalanceSheetRepository } from "./balance-sheet.repository.js";

export class BalanceSheetService {
  constructor(private readonly repository = new BalanceSheetRepository()) {}

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
      category?: string;
      offset?: number;
      limit?: number;
      kind?: "cash" | "material" | "credit" | "debit" | "bio" | "loan" | "advance" | "intangible" | "share";
    }
  ) {
    void filters?.client;
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    return this.repository.getDetails(period, {
      category: filters?.category,
      offset: filters?.offset,
      limit: filters?.limit,
      kind: filters?.kind,
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

  async materialTotals(
    tenantId: string,
    filters?: { from?: string; to?: string; year?: number; month?: number; startDate?: string; endDate?: string }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getMaterialLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    return {
      tenantId,
      report: "balance-sheet-material-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows
    };
  }

  async creditTotals(tenantId: string, filters?: { from?: string; to?: string }) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-credit-totals", filters);
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
