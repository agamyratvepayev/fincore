import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import {
  queryAdvanceDetails,
  queryAdvanceTotals,
  queryBioDetails,
  queryBioTotals,
  queryCashDetails,
  queryCashTotals,
  queryCreditDetails,
  queryCreditTotals,
  queryDebitDetails,
  queryDebitTotals,
  queryIntDetails,
  queryIntTotals,
  queryLoanDetails,
  queryLoanTotals,
  queryMaterialDetails,
  queryMaterialTotals,
  queryShcDetails,
  queryShcTotals
} from "./balance-sheet.queries.js";

type DateParams = {
  client?: string;
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export class BalanceSheetRepository {
  private dateParams(overrides?: DateParams) {
    return {
      year: overrides?.year ?? 0,
      month: overrides?.month ?? 0,
      startDate: overrides?.startDate ?? "1900-01-01",
      endDate: overrides?.endDate ?? "2100-01-01"
    };
  }

  private pageParams(filters?: { offset?: number; limit?: number }) {
    return {
      offset: filters?.offset ?? 0,
      limit: filters?.limit ?? 50
    };
  }

  async fetchCashTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryCashTotals(params), params);
  }

  async fetchCashDetails(
    category: string,
    overrides?: DateParams,
    page?: { offset?: number; limit?: number }
  ) {
    const params = {
      category: String(Number.parseInt(category, 10) || 0),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryCashDetails(params), params);
  }

  async fetchMaterialTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryMaterialTotals(params), params);
  }

  async fetchMaterialDetails(
    category: string,
    overrides?: DateParams,
    page?: { offset?: number; limit?: number }
  ) {
    const params = {
      category: String(Number.parseInt(category, 10) || 0),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryMaterialDetails(params), params);
  }

  async fetchAdvanceTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryAdvanceTotals(params), params);
  }

  async fetchAdvanceDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: code ? String(code).trim() : "",
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryAdvanceDetails(params), params);
  }

  async fetchCreditTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryCreditTotals(params), params);
  }

  async fetchCreditDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: code ? String(code).trim() : "",
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryCreditDetails(params), params);
  }

  async fetchDebitTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryDebitTotals(params), params);
  }

  async fetchDebitDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: code ? String(code).trim() : "",
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryDebitDetails(params), params);
  }

  async fetchBioTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryBioTotals(params), params);
  }

  async fetchBioDetails(
    category: string,
    overrides?: DateParams,
    page?: { offset?: number; limit?: number }
  ) {
    const params = {
      category: String(Number.parseInt(category, 10) || 0),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryBioDetails(params), params);
  }

  async fetchIntTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryIntTotals(params), params);
  }

  async fetchIntDetails(
    category: string,
    overrides?: DateParams,
    page?: { offset?: number; limit?: number }
  ) {
    const params = {
      category: String(Number.parseInt(category, 10) || 0),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryIntDetails(params), params);
  }

  async fetchShcTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryShcTotals(params), params);
  }

  async fetchShcDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: code ? String(code).trim() : "",
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryShcDetails(params), params);
  }

  async fetchLoanTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryLoanTotals(params), params);
  }

  async fetchLoanDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: code ? String(code).trim() : "",
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryLoanDetails(params), params);
  }

  async getLines(
    period: ReportPeriod,
    overrides?: DateParams
  ): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchCashTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.ID ?? row.id ?? row.CODE ?? row.code ?? row.CATEGORY ?? `BAL_${index + 1}`),
      label: String(
        row.NAME ??
          row.name ??
          row.CATEGORY ??
          row.category ??
          row.DEFINITION_ ??
          row.definition_ ??
          row.LABEL ??
          `Line ${index + 1}`
      ),
      amount: Number(row.AMOUNT ?? row.amount ?? row.BALANCE ?? row.balance ?? row.LINENET ?? row.linenet ?? 0),
      lineNet: Number(row.LINENET ?? row.linenet ?? row.AMOUNT ?? row.amount ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
    }));
  }

  async getDetails(
    period: ReportPeriod,
    filters: DateParams & { category?: string; offset?: number; limit?: number }
  ) {
    void period;
    return this.fetchCashDetails(filters.category ?? "0", filters, {
      offset: filters.offset ?? 0,
      limit: filters.limit ?? 100
    });
  }
}
