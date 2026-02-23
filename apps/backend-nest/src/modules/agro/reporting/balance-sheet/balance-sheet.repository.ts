import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import { queryCashDetails, queryCashTotals, queryMaterialDetails, queryMaterialTotals } from "./balance-sheet.queries.js";

type DateParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = DateParams & {
  category?: string;
  offset?: number;
  limit?: number;
};

export class BalanceSheetRepository {
  async fetchCashTotals(overrides?: DateParams) {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryCashTotals(params), params);
  }

  async fetchCashDetails(overrides?: DetailParams) {
    const params = {
      category: overrides?.category,
      offset: overrides?.offset ?? 0,
      limit: overrides?.limit ?? 50,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryCashDetails(params), params);
  }

  async fetchMaterialTotals(overrides?: DateParams) {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryMaterialTotals(params), params);
  }

  async fetchMaterialDetails(overrides?: DetailParams) {
    const params = {
      category: overrides?.category,
      offset: overrides?.offset ?? 0,
      limit: overrides?.limit ?? 50,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryMaterialDetails(params), params);
  }

  async getLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchCashTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.ID ?? row.id ?? `CASH_${index + 1}`),
      label: String(row.NAME ?? row.name ?? `Cash ${index + 1}`),
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      lineNet: Number(row.AMOUNT ?? row.amount ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      group: String(row.GROUP_ ?? row.group_ ?? "")
    }));
  }

  async getDetails(
    period: ReportPeriod,
    filters?: {
      category?: string;
      offset?: number;
      limit?: number;
      kind?: "cash" | "material" | "credit" | "debit" | "bio" | "loan" | "advance" | "intangible" | "share";
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    void period;
    if (filters?.kind === "material") {
      const rows = await this.fetchMaterialDetails({
        category: filters?.category,
        offset: filters?.offset,
        limit: filters?.limit,
        year: filters?.year,
        month: filters?.month,
        startDate: filters?.startDate,
        endDate: filters?.endDate
      });
      return rows.map((row) => ({
        ...row,
        ITEMNAME: row.NAME ?? row.name ?? "",
        OUTCOST: toNumeric(row.OUTCOST ?? row.outcost),
        OUTCOSTCURR: toNumeric(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur),
        LINENET: toNumeric(row.OUTCOST ?? row.outcost),
        REPORTNET: toNumeric(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur)
      }));
    }
    return this.fetchCashDetails({
      category: filters?.category,
      offset: filters?.offset,
      limit: filters?.limit,
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
  }

  async getMaterialLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchMaterialTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.RN ?? row.rn ?? index + 1),
      label: String(row.WHOUSE ?? row.whouse ?? `Warehouse ${index + 1}`),
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      lineNet: Number(row.OUTCOST ?? row.outcost ?? 0),
      reportNet: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
    }));
  }
}

function toNumeric(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const text = String(value).trim();
  if (!text) return 0;
  const normalized = text.replace(/\s+/g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}
