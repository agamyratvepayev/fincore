import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import type { ReportPeriod } from "../../../../shared/reporting/reporting.types.js";
import {
  queryBalanceDetails,
  queryBalanceTotals,
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
  category?: number;
  offset?: number;
  limit?: number;
};

export type RevenueTotalRow = {
  id: number;
  name: string;
  lineNet: number;
  reportNet: number;
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
    overrides?: DateParams,
    clientCode?: string
  ): Promise<RevenueTotalRow[]> {
    void period;
    const params = {
      code: clientCode,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };

    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(params), params);

    return rows.map((row) => ({
      id: Number(row.ID ?? 0),
      name: String(row.NAME ?? row.ADDR1 ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0)
    }));
  }

  async getExpenseTotals(
    period: ReportPeriod,
    overrides?: DateParams,
    clientCode?: string
  ): Promise<RevenueTotalRow[]> {
    void period;
    const params = {
      code: clientCode,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };

    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(params), params);

    return rows.map((row) => ({
      id: Number(row.ID ?? 0),
      name: String(row.NAME ?? row.ADDR1 ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0)
    }));
  }

  async getBalanceTotals(
    period: ReportPeriod,
    overrides?: DateParams,
    clientCode?: string
  ): Promise<RevenueTotalRow[]> {
    void period;
    const params = {
      code: clientCode,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };

    const rows = await executeNamedQuery<Record<string, unknown>>(queryBalanceTotals(params), params);

    return rows.map((row) => ({
      id: Number(row.ID ?? 0),
      name: String(row.CATEGORY ?? row.NAME ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0)
    }));
  }

  async getRevenueDetails(
    period: ReportPeriod,
    detail?: DetailParams,
    clientCode?: string
  ): Promise<Record<string, unknown>[]> {
    void period;
    const params = {
      code: clientCode,
      category: detail?.category,
      offset: detail?.offset,
      limit: detail?.limit,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };

    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(params), params);
  }

  async getExpenseDetails(
    period: ReportPeriod,
    detail?: DetailParams,
    clientCode?: string
  ): Promise<Record<string, unknown>[]> {
    void period;
    const params = {
      code: clientCode,
      category: detail?.category,
      offset: detail?.offset,
      limit: detail?.limit,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };

    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
  }

  async getBalanceDetails(
    period: ReportPeriod,
    detail?: DetailParams,
    clientCode?: string
  ): Promise<Record<string, unknown>[]> {
    void period;
    const params = {
      code: clientCode,
      category: detail?.category,
      offset: detail?.offset,
      limit: detail?.limit,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };

    return executeNamedQuery<Record<string, unknown>>(queryBalanceDetails(params), params);
  }
}
