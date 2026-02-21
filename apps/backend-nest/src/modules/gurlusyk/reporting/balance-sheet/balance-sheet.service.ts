import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { getDefaultClientCode } from "../../../../shared/reporting/reporting.constants.js";
import type { ReportResponse } from "../../../../shared/reporting/reporting.types.js";
import { BalanceSheetRepository } from "./balance-sheet.repository.js";
import { IncomeStatementRepository } from "../income-statement/income-statement.repository.js";

export class BalanceSheetService {
  constructor(
    private readonly repository = new BalanceSheetRepository(),
    private readonly incomeRepository = new IncomeStatementRepository()
  ) {}

  private dateOverrides(filters?: {
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
  }) {
    return {
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    };
  }

  private async withSummary(
    loadDetails: (page: { offset: number; limit: number }) => Promise<Record<string, unknown>[]>,
    detailKey: string,
    detailPage: { offset: number; limit: number }
  ) {
    const summaryFilters = { offset: 0, limit: 0 };
    const [dateFilters, allSummaryResults, details] = await Promise.all([
      this.incomeRepository.getDateFilters(),
      loadDetails(summaryFilters).catch((error) => {
        console.error(`Error fetching ${detailKey} summary:`, (error as Error).message);
        return [];
      }),
      loadDetails(detailPage).catch((error) => {
        console.error(`Error fetching ${detailKey} details:`, (error as Error).message);
        return [];
      })
    ]);

    return {
      dateFilters,
      summaryDetails: allSummaryResults,
      [detailKey]: details,
      allSummaryResults
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
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
  }

  async statementTotals(
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
    void buildReportPeriod(filters?.from, filters?.to);
    const overrides = this.dateOverrides(filters);
    const [dateFilters, categoryCash, categoryMaterial, categoryAdvance, categoryCredit, categoryDebit, categoryBio, categoryInt, categoryShc, categoryLoan] = await Promise.all([
      this.incomeRepository.getDateFilters(),
      this.repository.fetchCashTotals(overrides),
      this.repository.fetchMaterialTotals(overrides),
      this.repository.fetchAdvanceTotals(overrides),
      this.repository.fetchCreditTotals(overrides),
      this.repository.fetchDebitTotals(overrides),
      this.repository.fetchBioTotals(overrides),
      this.repository.fetchIntTotals(overrides),
      this.repository.fetchShcTotals(overrides),
      this.repository.fetchLoanTotals(overrides)
    ]);

    return {
      dateFilters,
      categoryCash,
      categoryMaterial,
      categoryAdvance,
      categoryCredit,
      categoryDebit,
      categoryBio,
      categoryInt,
      categoryShc,
      categoryLoan
    };
  }

  async cashDetails(
    tenantId: string,
    filters?: { category?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const category = filters?.category ?? "0";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchCashDetails(category, overrides, { offset, limit }),
      "cashDetails",
      detailPage
    );
    const detailRows = payload.cashDetails as Record<string, unknown>[];
    return {
      ...payload,
      categoryName: String(detailRows[0]?.NAME ?? "Unknown"),
      groupName: String(detailRows[0]?.GROUP_ ?? "Unknown")
    };
  }

  async materialDetails(
    tenantId: string,
    filters?: { category?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const category = filters?.category ?? "0";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchMaterialDetails(category, overrides, { offset, limit }),
      "materialDetails",
      detailPage
    );
    const detailRows = payload.materialDetails as Record<string, unknown>[];
    return {
      ...payload,
      warehouseName: String(detailRows[0]?.WHOUSE ?? "Unknown")
    };
  }

  async advanceDetails(
    tenantId: string,
    filters?: { code?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = filters?.code ?? "";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchAdvanceDetails(code, overrides, { offset, limit }),
      "advanceDetails",
      detailPage
    );
    const detailRows = payload.advanceDetails as Record<string, unknown>[];
    return {
      ...payload,
      clientName: String(detailRows[0]?.DEFINITION_ ?? detailRows[0]?.CODE ?? "Unknown"),
      clientCode: code || "Unknown"
    };
  }

  async creditDetails(
    tenantId: string,
    filters?: { code?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = filters?.code ?? "";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchCreditDetails(code, overrides, { offset, limit }),
      "creditDetails",
      detailPage
    );
    const detailRows = payload.creditDetails as Record<string, unknown>[];
    return {
      ...payload,
      clientName: String(detailRows[0]?.DEFINITION_ ?? detailRows[0]?.CODE ?? "Unknown"),
      clientCode: code || "Unknown",
      groupName: String(detailRows[0]?.GROUP_ ?? "Unknown")
    };
  }

  async debitDetails(
    tenantId: string,
    filters?: { code?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = filters?.code ?? "";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchDebitDetails(code, overrides, { offset, limit }),
      "debitDetails",
      detailPage
    );
    const detailRows = payload.debitDetails as Record<string, unknown>[];
    return {
      ...payload,
      clientName: String(detailRows[0]?.DEFINITION_ ?? detailRows[0]?.CODE ?? "Unknown"),
      clientCode: code || "Unknown",
      groupName: String(detailRows[0]?.GROUP_ ?? "Unknown")
    };
  }

  async bioDetails(
    tenantId: string,
    filters?: { category?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const category = filters?.category ?? "0";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchBioDetails(category, overrides, { offset, limit }),
      "bioDetails",
      detailPage
    );
    const detailRows = payload.bioDetails as Record<string, unknown>[];
    return {
      ...payload,
      warehouseName: String(detailRows[0]?.WHOUSE ?? "Unknown")
    };
  }

  async intDetails(
    tenantId: string,
    filters?: { category?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const category = filters?.category ?? "0";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchIntDetails(category, overrides, { offset, limit }),
      "intDetails",
      detailPage
    );
    const detailRows = payload.intDetails as Record<string, unknown>[];
    return {
      ...payload,
      warehouseName: String(detailRows[0]?.WHOUSE ?? "Unknown")
    };
  }

  async shcDetails(
    tenantId: string,
    filters?: { code?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = filters?.code ?? "";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchShcDetails(code, overrides, { offset, limit }),
      "shcDetails",
      detailPage
    );
    const detailRows = payload.shcDetails as Record<string, unknown>[];
    return {
      ...payload,
      clientName: String(detailRows[0]?.DEFINITION_ ?? detailRows[0]?.CODE ?? "Unknown"),
      clientCode: code || "Unknown",
      groupName: String(detailRows[0]?.GROUP_ ?? "Unknown")
    };
  }

  async loanDetails(
    tenantId: string,
    filters?: { code?: string; year?: number; month?: number; startDate?: string; endDate?: string; offset?: number; limit?: number }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = filters?.code ?? "";
    const overrides = this.dateOverrides(filters);
    const detailPage = { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 };
    const payload = await this.withSummary(
      ({ offset, limit }) => this.repository.fetchLoanDetails(code, overrides, { offset, limit }),
      "loanDetails",
      detailPage
    );
    const detailRows = payload.loanDetails as Record<string, unknown>[];
    return {
      ...payload,
      clientName: String(detailRows[0]?.DEFINITION_ ?? detailRows[0]?.CODE ?? "Unknown"),
      clientCode: code || "Unknown",
      specodeName: String(detailRows[0]?.SPECODE ?? "Unknown")
    };
  }
}
