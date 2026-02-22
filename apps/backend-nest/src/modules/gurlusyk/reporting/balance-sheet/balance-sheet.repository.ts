import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import { queryCashDetails, queryCashTotals } from "./balance-sheet.queries.js";

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
    filters: DateParams & { category?: string; offset?: number; limit?: number }
  ) {
    void period;
    return this.fetchCashDetails(filters.category ?? "0", filters, {
      offset: filters.offset ?? 0,
      limit: filters.limit ?? 100
    });
  }
}
