import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import { queryCashDetails, queryCashTotals } from "./balance-sheet.queries.js";

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
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    void period;
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
}
