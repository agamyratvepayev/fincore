import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import {
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
      id: Number(row.ID ?? row.id ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0),
      outCost: Number(row.OUTCOST ?? row.outcost ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
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
      id: Number(row.RN ?? row.rn ?? row.ID ?? row.id ?? 0),
      category: String(row.CATEGORY ?? row.category ?? ""),
      lineNet: Number(row.LINENET ?? row.linenet ?? row.AMOUNT ?? row.amount ?? row.OUTCOST ?? row.outcost ?? 0),
      reportNet: Number(
        row.REPORTNET ?? row.reportnet ?? row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0
      ),
      outCost: Number(row.OUTCOST ?? row.outcost ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0)
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
    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
  }
}
