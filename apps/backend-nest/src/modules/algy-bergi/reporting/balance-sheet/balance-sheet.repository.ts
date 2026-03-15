import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportLine, ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import { queryCreditDetails, queryCreditTotals } from "./balance-sheet.queries.js";

type DateParams = {
  code?: string;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export class BalanceSheetRepository {
  async fetchCreditTotals(overrides?: DateParams) {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryCreditTotals(params), params);
  }

  async fetchCreditDetails(overrides?: DateParams) {
    const params = {
      code: String(overrides?.code ?? "").trim(),
      offset: overrides?.offset ?? 0,
      limit: overrides?.limit ?? 50,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryCreditDetails(params), params);
  }

  async getLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    void period;
    const rows = await this.fetchCreditTotals(overrides);
    return rows.map((row, index) => ({
      code: String(row.CODE ?? row.code ?? `ALB_${index + 1}`),
      label: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? `Definition ${index + 1}`),
      amount: Number(row.BALANCE ?? row.balance ?? 0),
      lineNet: Number(row.INCOME ?? row.income ?? 0),
      reportNet: Number(row.OUTCOME ?? row.outcome ?? 0),
      group: String(row.GROUP_ ?? row.group_ ?? "BEYLEKILER")
    }));
  }

  async getDetails(
    period: ReportPeriod,
    overrides?: {
      code?: string;
      offset?: number;
      limit?: number;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    void period;
    const code = String(overrides?.code ?? "").trim();
    const rows = await this.fetchCreditDetails({
      code: overrides?.code,
      offset: overrides?.offset,
      limit: overrides?.limit,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    });
    if (!code) return rows;
    return rows.filter((row) => String(row.CODE ?? row.code ?? "").trim() === code);
  }

  async getCreditLines(period: ReportPeriod, overrides?: DateParams): Promise<ReportLine[]> {
    return this.getLines(period, overrides);
  }
}
