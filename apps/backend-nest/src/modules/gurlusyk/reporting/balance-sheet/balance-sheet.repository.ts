import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import {
  queryCashDetails,
  queryCashTotals,
  queryMaterialDetails,
  queryMaterialTotals
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
    filters: DateParams & { category?: string; offset?: number; limit?: number; kind?: "cash" | "material" }
  ) {
    void period;
    if (filters.kind === "material") {
      return this.fetchMaterialDetails(filters.category ?? "0", filters, {
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
        const reportNet = Number(row.OUTCOSTCURR ?? row.outcostcurr ?? 0);
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
}
