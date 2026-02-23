import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import {
  queryDateFilters,
  queryExpenseDetails,
  queryExpenseDetailsFallback,
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
  id?: number;
  offset?: number;
  limit?: number;
};

export type RevenueTotalRow = {
  id: number;
  category: string;
  lineNet: number;
  reportNet: number;
  outCost: number;
  outCostCurr: number;
};

export class IncomeStatementRepository {
  async getDateFilters() {
    return executeNamedQuery<Record<string, unknown>>(queryDateFilters());
  }

  async getRevenueTotals(overrides?: DateParams): Promise<RevenueTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(params), params);
    return rows.map((row) => ({
      id: Number(row.ID ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0),
      outCost: Number(row.OUTCOST ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.OUTCOSTCUR ?? 0)
    }));
  }

  async getExpenseTotals(overrides?: DateParams): Promise<RevenueTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(params), params);
    return rows.map((row) => ({
      id: Number(row.RN ?? row.ID ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? row.AMOUNT ?? row.OUTCOST ?? 0),
      reportNet: Number(row.REPORTNET ?? row.OUTCOSTCURR ?? row.OUTCOSTCUR ?? 0),
      outCost: Number(row.OUTCOST ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.OUTCOSTCUR ?? 0)
    }));
  }

  async getRevenueDetails(detail?: DetailParams): Promise<Record<string, unknown>[]> {
    const params = {
      id: detail?.id,
      offset: detail?.offset,
      limit: detail?.limit,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(params), params);
  }

  async getExpenseDetails(detail?: DetailParams): Promise<Record<string, unknown>[]> {
    const params = {
      id: detail?.id,
      offset: detail?.offset,
      limit: detail?.limit,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };
    try {
      return await executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
    } catch (error) {
      const message = String((error as Error)?.message ?? "");
      if (!/converting data type varchar to float/i.test(message)) throw error;
      return executeNamedQuery<Record<string, unknown>>(queryExpenseDetailsFallback(params), params);
    }
  }
}
