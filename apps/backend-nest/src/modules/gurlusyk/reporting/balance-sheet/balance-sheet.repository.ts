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
  queryIntangibleDetails,
  queryIntangibleTotals,
  queryLoanDetails,
  queryLoanTotals,
  queryMaterialDetails,
  queryMaterialTotals,
  queryShareDetails,
  queryShareTotals
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
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
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

  async fetchCreditTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryCreditTotals(params), params);
  }

  async fetchCreditDetails(
    code: string,
    overrides?: DateParams,
    page?: { offset?: number; limit?: number }
  ) {
    const params = {
      code: String(code ?? "").trim(),
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
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryDebitDetails(params), params);
  }

  async fetchBioTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryBioTotals(params), params);
  }

  async fetchBioDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryBioDetails(params), params);
  }

  async fetchLoanTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryLoanTotals(params), params);
  }

  async fetchLoanDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryLoanDetails(params), params);
  }

  async fetchAdvanceTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryAdvanceTotals(params), params);
  }

  async fetchAdvanceDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryAdvanceDetails(params), params);
  }

  async fetchIntangibleTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryIntangibleTotals(params), params);
  }

  async fetchIntangibleDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryIntangibleDetails(params), params);
  }

  async fetchShareTotals(overrides?: DateParams) {
    const params = this.dateParams(overrides);
    return executeNamedQuery<Record<string, unknown>>(queryShareTotals(params), params);
  }

  async fetchShareDetails(code: string, overrides?: DateParams, page?: { offset?: number; limit?: number }) {
    const params = {
      code: String(code ?? "").trim(),
      ...this.pageParams(page),
      ...this.dateParams(overrides)
    };
    return executeNamedQuery<Record<string, unknown>>(queryShareDetails(params), params);
  }

  async getLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchCashTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.ID ?? row.id ?? `BAL_${index + 1}`),
      label: String(row.NAME ?? row.name ?? `Line ${index + 1}`),
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      lineNet: Number(row.AMOUNT ?? row.amount ?? row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      group: String(row.GROUP_ ?? row.group_ ?? "")
    }));
  }

  async getDetails(
    period: ReportPeriod,
    filters: DateParams & {
      category?: string;
      offset?: number;
      limit?: number;
      kind?: "cash" | "material" | "credit" | "debit" | "bio" | "loan" | "advance" | "intangible" | "share";
    }
  ) {
    void period;
    if (filters.kind === "material") {
      return this.fetchMaterialDetails(filters.category ?? "0", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "credit") {
      return this.fetchCreditDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "debit") {
      return this.fetchDebitDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "bio") {
      return this.fetchBioDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "loan") {
      return this.fetchLoanDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "advance") {
      return this.fetchAdvanceDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "intangible") {
      return this.fetchIntangibleDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    if (filters.kind === "share") {
      return this.fetchShareDetails(filters.category ?? "", filters, {
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 100
      });
    }
    return this.fetchCashDetails(filters.category ?? "0", filters, {
      offset: filters.offset ?? 0,
      limit: filters.limit ?? 100
    });
  }

  async getMaterialLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchMaterialTotals(overrides);
    return rows
      .map((row, index) => {
        const hasExplicitAmount = row.AMOUNT != null || row.amount != null || row.QTY != null || row.qty != null;
        const qty = Number(row.AMOUNT ?? row.amount ?? row.QTY ?? row.qty ?? 0);
        const lineNet = Number(row.OUTCOST ?? row.outcost ?? 0);
        const reportNet = Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0);
        return {
          code: String(row.RN ?? row.rn ?? `MAT_${index + 1}`),
          label: String(row.WHOUSE ?? row.whouse ?? `Warehouse ${index + 1}`),
          amount: qty,
          lineNet,
          reportNet,
          hasExplicitAmount
        };
      })
      .filter((row) => {
        if ((row as ReportLine & { hasExplicitAmount?: boolean }).hasExplicitAmount) {
          return Math.abs(Number(row.amount ?? 0)) > 0.000001;
        }
        return Math.abs(Number(row.lineNet ?? 0)) > 0.000001 || Math.abs(Number(row.reportNet ?? 0)) > 0.000001;
      })
      .map(({ hasExplicitAmount: _hasExplicitAmount, ...row }) => row);
  }

  async getCreditLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchCreditTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.CODE ?? row.code ?? `CREDIT_${index + 1}`),
      label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Credit ${index + 1}`),
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      group: String(row.GROUP_ ?? row.group_ ?? "BEYLEKILER")
    }));
  }

  async getDebitLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchDebitTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.CODE ?? row.code ?? `DEBIT_${index + 1}`),
      label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Debit ${index + 1}`),
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      group: String(row.GROUP_ ?? row.group_ ?? "BEYLEKILER")
    }));
  }

  async getBioLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchBioTotals(overrides);
    return rows
      .map((row, index) => ({
        code: String(row.CODE ?? row.code ?? `BIO_${index + 1}`),
        label: String(row.NAME ?? row.name ?? `Bioactive ${index + 1}`),
        amount: Number(row.AMOUNT ?? row.amount ?? 0),
        lineNet: Number(row.OUTCOST ?? row.outcost ?? 0),
        reportNet: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
      }))
      .filter((row) => Math.abs(Number(row.amount ?? 0)) > 0.000001);
  }

  async getLoanLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchLoanTotals(overrides);
    return rows
      .map((row, index) => ({
        code: String(row.CODE ?? row.code ?? `LOAN_${index + 1}`),
        label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Loan ${index + 1}`),
        amount: Number(row.AMOUNT ?? row.amount ?? 0),
        lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
        reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
        group: String(row.SPECODE ?? row.specode ?? "")
      }))
      .filter((row) => Math.abs(Number(row.amount ?? 0)) > 0.000001);
  }

  async getAdvanceLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchAdvanceTotals(overrides);
    return rows
      .map((row, index) => ({
        code: String(row.CODE ?? row.code ?? `ADV_${index + 1}`),
        label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Advance ${index + 1}`),
        amount: Number(row.AMOUNT ?? row.amount ?? 0),
        lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
        reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
      }))
      .filter((row) => Math.abs(Number(row.amount ?? 0)) > 0.000001);
  }

  async getIntangibleLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchIntangibleTotals(overrides);
    return rows
      .map((row, index) => ({
        code: String(row.CODE ?? row.code ?? `INT_${index + 1}`),
        label: String(row.NAME ?? row.name ?? `Intangible ${index + 1}`),
        amount: Number(row.AMOUNT ?? row.amount ?? 0),
        lineNet: Number(row.OUTCOST ?? row.outcost ?? 0),
        reportNet: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
      }))
      .filter((row) => Math.abs(Number(row.amount ?? 0)) > 0.000001);
  }

  async getShareLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchShareTotals(overrides);
    return rows
      .map((row, index) => ({
        code: String(row.CODE ?? row.code ?? `SHARE_${index + 1}`),
        label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Share ${index + 1}`),
        amount: Number(row.AMOUNT ?? row.amount ?? 0),
        lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
        reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
        group: String(row.GROUP_ ?? row.group_ ?? "")
      }))
      .filter((row) => Math.abs(Number(row.amount ?? 0)) > 0.000001);
  }
}
