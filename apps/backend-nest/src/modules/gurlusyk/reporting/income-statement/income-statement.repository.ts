import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import {
  queryClientNames,
  queryDateFilters,
  queryExpenseDetails,
  queryExpenseTotals,
  queryRevenueDetails,
  queryRevenueTotals
} from "./income-statement.queries.js";

type DateParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = DateParams & {
  category: string;
  offset: number;
  limit: number;
};

export class IncomeStatementRepository {
  async getDateFilters() {
    return executeNamedQuery<Record<string, unknown>>(queryDateFilters());
  }

  async getClientNames() {
    return executeNamedQuery<Record<string, unknown>>(queryClientNames());
  }

  async getRevenueTotals(
    period: ReportPeriod,
    overrides?: { year?: number; month?: number; startDate?: string; endDate?: string },
    clientCode?: string
  ) {
    void period;
    const params = {
      code: clientCode,
      year: overrides?.year ?? 0,
      month: overrides?.month ?? 0,
      startDate: overrides?.startDate ?? "1900-01-01",
      endDate: overrides?.endDate ?? "2100-01-01"
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(params), params);
    return rows.map((row) => ({
      id: String(row.ID ?? ""),
      name: String(row.NAME ?? row.CATEGORY ?? "Category"),
      group: String(row.CATEGORY ?? row.GROUP_ ?? "").toUpperCase(),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0),
      outCost: Number(row.OUTCOST ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? 0)
    }));
  }

  async getExpenseTotals(
    period: ReportPeriod,
    overrides?: { year?: number; month?: number; startDate?: string; endDate?: string },
    clientCode?: string
  ) {
    void period;
    const params = {
      code: clientCode,
      year: overrides?.year ?? 0,
      month: overrides?.month ?? 0,
      startDate: overrides?.startDate ?? "1900-01-01",
      endDate: overrides?.endDate ?? "2100-01-01"
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(params), params);
    return rows.map((row) => ({
      id: String(row.ID ?? ""),
      name: String(row.NAME ?? ""),
      definition: String(row.DEFINITION_ ?? row.definition_ ?? row.ADDR1 ?? row.NAME ?? "Other"),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
    }));
  }

  async getRevenueDetails(
    period: ReportPeriod,
    detail: Omit<DetailParams, keyof DateParams>,
    overrides?: DateParams,
    clientCode?: string
  ) {
    void period;
    const params = {
      code: clientCode,
      category: detail.category,
      offset: detail.offset,
      limit: detail.limit,
      year: overrides?.year ?? 0,
      month: overrides?.month ?? 0,
      startDate: overrides?.startDate ?? "1900-01-01",
      endDate: overrides?.endDate ?? "2100-01-01"
    };
    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(params), params);
  }

  async getExpenseDetails(
    period: ReportPeriod,
    detail: Omit<DetailParams, keyof DateParams>,
    overrides?: DateParams,
    clientCode?: string
  ) {
    void period;
    const params = {
      code: clientCode,
      category: detail.category,
      offset: detail.offset,
      limit: detail.limit,
      year: overrides?.year ?? 0,
      month: overrides?.month ?? 0,
      startDate: overrides?.startDate ?? "1900-01-01",
      endDate: overrides?.endDate ?? "2100-01-01"
    };
    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
  }
}
