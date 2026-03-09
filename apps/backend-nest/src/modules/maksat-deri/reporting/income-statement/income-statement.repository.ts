import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import { queryExpenseDetails, queryExpenseTotals, queryRevenueDetails, queryRevenueTotals } from "./income-statement.queries.js";

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

export type ExpenseTotalRow = {
  id: number;
  category: string;
  lineNet: number;
  reportNet: number;
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
  async getRevenueTotals(overrides?: DateParams): Promise<RevenueTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(params), params);
    return rows.map((row) => ({
      id: Number(row.ID ?? row.id ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      outCost: Number(row.OUTCOST ?? row.outcost ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
    }));
  }

  async getExpenseTotals(overrides?: DateParams): Promise<ExpenseTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(params), params);
    return rows.map((row) => ({
      id: Number(row.RN ?? row.rn ?? row.ID ?? row.id ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
    }));
  }

  async getExpenseDetails(detail?: DetailParams): Promise<Record<string, unknown>[]> {
    const params = {
      id: detail?.id,
      offset: detail?.offset ?? 0,
      limit: detail?.limit ?? 50,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
  }

  async getRevenueDetails(detail?: DetailParams): Promise<Record<string, unknown>[]> {
    const params = {
      id: detail?.id,
      offset: detail?.offset ?? 0,
      limit: detail?.limit ?? 50,
      year: detail?.year,
      month: detail?.month,
      startDate: detail?.startDate,
      endDate: detail?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(params), params);
  }
}
