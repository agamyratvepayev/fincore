import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { getDefaultClientCode } from "../../../../shared/reporting/reporting.constants.js";
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
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const clientCode = filters?.client || getDefaultClientCode(tenantId);
    const lines = await this.repository.getLines(period, {
      code: clientCode,
      client: clientCode,
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
      kind?: "cash" | "material" | "credit" | "bio" | "loan" | "advance";
    }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const clientCode = filters?.client || getDefaultClientCode(tenantId);
    return this.repository.getDetails(period, {
      code: clientCode,
      client: clientCode,
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

  async materialTotals(
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

  async creditTotals(
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
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows
    };
  }

  async bioTotals(
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
    const rows = await this.repository.getBioLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    return {
      tenantId,
      report: "balance-sheet-bio-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows
    };
  }

  async loanTotals(
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
    const rows = await this.repository.getLoanLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    return {
      tenantId,
      report: "balance-sheet-loan-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows
    };
  }

  async advanceTotals(
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
    const rows = await this.repository.getAdvanceLines(period, {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    return {
      tenantId,
      report: "balance-sheet-advance-totals",
      period,
      totals: {
        totalTmt: rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0),
        totalUsd: rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0)
      },
      categories: rows
    };
  }
}
