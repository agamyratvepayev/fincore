import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";

type TotalsFilters = {
  from?: string;
  to?: string;
};

export class BalanceSheetService {
  async execute(tenantId: string, filters?: TotalsFilters): Promise<ReportResponse> {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    return {
      tenantId,
      report: "balance-sheet",
      period,
      currency: "USD",
      generatedAt: new Date().toISOString(),
      lines: []
    };
  }

  async details(tenantId: string, filters?: TotalsFilters & { offset?: number; limit?: number }) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    return {
      tenantId,
      report: "balance-sheet-details",
      period,
      paging: { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 },
      rows: []
    };
  }

  private emptyTotals(tenantId: string, report: string, filters?: TotalsFilters) {
    const period = buildReportPeriod(filters?.from, filters?.to);
    return {
      tenantId,
      report,
      period,
      totals: { totalTmt: 0, totalUsd: 0 },
      categories: []
    };
  }

  async materialTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-material-totals", filters);
  }

  async creditTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-credit-totals", filters);
  }

  async debitTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-debit-totals", filters);
  }

  async bioTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-bio-totals", filters);
  }

  async loanTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-loan-totals", filters);
  }

  async advanceTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-advance-totals", filters);
  }

  async intangibleTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-intangible-totals", filters);
  }

  async shareTotals(tenantId: string, filters?: TotalsFilters) {
    await ensureReportingTenantReady(tenantId);
    return this.emptyTotals(tenantId, "balance-sheet-share-totals", filters);
  }
}
