import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import {
  queryDateFilters,
  queryExpenseDetails,
  queryExpenseTotals,
  queryRevenueDetails,
  queryRevenueTotals
} from "./income-statement.queries.js";

type DateParams = {
  code?: string;
  clcode?: string;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export type IncomeTotalRow = {
  code: string;
  definition: string;
  clcode: string;
  client: string;
  lineNet: number;
  reportNet: number;
};

export class IncomeStatementRepository {
  async getDateFilters(): Promise<Record<string, unknown>[]> {
    return executeNamedQuery<Record<string, unknown>>(queryDateFilters(), {});
  }

  async getRevenueTotals(overrides?: DateParams): Promise<IncomeTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(params), params);
    return rows.map((row) => ({
      code: String(row.CODE ?? row.code ?? "").trim(),
      definition: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? "").trim(),
      clcode: String(row.CLCODE ?? row.clcode ?? "").trim(),
      client: String(row.CLIENT ?? row.client ?? "").trim(),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
    }));
  }

  async getExpenseTotals(overrides?: DateParams): Promise<IncomeTotalRow[]> {
    const params = {
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(params), params);
    return rows.map((row) => ({
      code: String(row.CODE ?? row.code ?? "").trim(),
      definition: String(row.DEFINITION_ ?? row.definition_ ?? row.DEFINITION ?? row.definition ?? "").trim(),
      clcode: String(row.CLCODE ?? row.clcode ?? "").trim(),
      client: String(row.CLIENT ?? row.client ?? "").trim(),
      lineNet: Number(row.LINENET ?? row.linenet ?? 0),
      reportNet: Number(row.REPORTNET ?? row.reportnet ?? 0)
    }));
  }

  async getRevenueDetails(overrides?: DateParams): Promise<Record<string, unknown>[]> {
    const params = {
      code: String(overrides?.code ?? "").trim(),
      clcode: String(overrides?.clcode ?? "").trim(),
      offset: overrides?.offset ?? 0,
      limit: overrides?.limit ?? 50,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(params), params);
  }

  async getExpenseDetails(overrides?: DateParams): Promise<Record<string, unknown>[]> {
    const params = {
      code: String(overrides?.code ?? "").trim(),
      clcode: String(overrides?.clcode ?? "").trim(),
      offset: overrides?.offset ?? 0,
      limit: overrides?.limit ?? 50,
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(params), params);
  }
}
