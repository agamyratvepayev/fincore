import { executeNamedQuery } from "@fincore/db-mssql/src/query.js";
import { queryCashflowAccounts, queryCashflowDateFilters, queryCashflowDetails, queryCashflowTotals } from "./cashflow.queries.js";

type CashflowParams = {
  code?: string;
  clcode?: string;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export type CashflowRow = {
  cashCode: string;
  cashName: string;
  group: string;
  clientCode: string;
  clientName: string;
  income: number;
  outcome: number;
};

export type CashflowAccountRow = {
  code: string;
  name: string;
};

export class CashflowRepository {
  async getDateFilters(): Promise<Record<string, unknown>[]> {
    return executeNamedQuery<Record<string, unknown>>(queryCashflowDateFilters(), {});
  }

  async getAccounts(): Promise<CashflowAccountRow[]> {
    const rows = await executeNamedQuery<Record<string, unknown>>(queryCashflowAccounts(), {});
    return rows.map((row) => ({
      code: String(row.CODE ?? row.code ?? "").trim(),
      name: String(row.NAME ?? row.name ?? row.DEFINITION_ ?? row.definition_ ?? "").trim()
    }));
  }

  async getDetails(overrides?: CashflowParams): Promise<Record<string, unknown>[]> {
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
    return executeNamedQuery<Record<string, unknown>>(queryCashflowDetails(params), params);
  }

  async getTotals(overrides?: CashflowParams): Promise<CashflowRow[]> {
    const params = {
      code: String(overrides?.code ?? "").trim(),
      year: overrides?.year,
      month: overrides?.month,
      startDate: overrides?.startDate,
      endDate: overrides?.endDate
    };
    const rows = await executeNamedQuery<Record<string, unknown>>(queryCashflowTotals(params), params);
    return rows.map((row) => ({
      cashCode: String(row.CODE ?? row.code ?? ""),
      cashName: String(row.NAME ?? row.name ?? row.DEFINITION_ ?? row.definition_ ?? ""),
      group: String(row.GROUP_ ?? row.group_ ?? row.GROUP ?? row.group ?? "BEYLEKILER"),
      clientCode: String(row.CLCODE ?? row.clcode ?? ""),
      clientName: String(row.CLIENT ?? row.client ?? ""),
      income: Number(row.INCOME ?? row.income ?? 0),
      outcome: Number(row.OUTCOME ?? row.outcome ?? 0)
    }));
  }
}
