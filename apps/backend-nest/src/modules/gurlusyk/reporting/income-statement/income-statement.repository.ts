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
  category?: number | string;
  offset?: number;
  limit?: number;
};

export type RevenueTotalRow = {
  id: number | string;
  name: string;
  lineNet: number;
  reportNet: number;
  outCost?: number;
  outCostCurr?: number;
  disableDetails?: boolean;
};

export class IncomeStatementRepository {
  async getDateFilters(tenantId: string) {
    return executeNamedQuery<Record<string, unknown>>(queryDateFilters(tenantId));
  }

  async getClientNames(tenantId: string) {
    return executeNamedQuery<Record<string, unknown>>(queryClientNames(tenantId));
  }

  async getRevenueTotals(
    tenantId: string,
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

    const rows = await executeNamedQuery<Record<string, unknown>>(queryRevenueTotals(tenantId, params), params);

    return rows.map((row) => ({
      id: isAgroTenant(tenantId) ? String(row.CATEGORY ?? row.NAME ?? "") : Number(row.ID ?? 0),
      name: String(row.NAME ?? row.ADDR1 ?? row.CATEGORY ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0),
      outCost: Number(row.OUTCOST ?? 0),
      outCostCurr: Number(row.OUTCOSTCURR ?? row.OUTCOSTCUR ?? 0)
    }));
  }

  async getExpenseTotals(
    tenantId: string,
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

    if (isAgroTenant(tenantId)) return [];
    const rows = await executeNamedQuery<Record<string, unknown>>(queryExpenseTotals(tenantId, params), params);

    return rows.map((row) => ({
      id: Number(row.ID ?? 0),
      name: String(row.NAME ?? row.ADDR1 ?? ""),
      lineNet: Number(row.LINENET ?? 0),
      reportNet: Number(row.REPORTNET ?? 0)
    }));
  }

  async getBalanceTotals(
    tenantId: string,
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

    if (isAgroTenant(tenantId)) return [];
    const rows = await executeNamedQuery<Record<string, unknown>>(queryBalanceTotals(tenantId, params), params);

    return rows.map((row) => ({
      id: Number(row.ID ?? row.id ?? row.RN ?? row.rn ?? 0),
      name: String(row.CATEGORY ?? row.category ?? row.NAME ?? row.name ?? row.ADDR1 ?? row.addr1 ?? ""),
      lineNet: Number(row.LINENET ?? row.linenet ?? row.AMOUNT ?? row.amount ?? row.OUTCOST ?? row.outcost ?? 0),
      reportNet: Number(
        row.REPORTNET ?? row.reportnet ?? row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0
      )
    }));
  }

  async getRevenueDetails(
    tenantId: string,
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

    return executeNamedQuery<Record<string, unknown>>(queryRevenueDetails(tenantId, params), params);
  }

  async getExpenseDetails(
    tenantId: string,
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

    if (isAgroTenant(tenantId)) return [];
    return executeNamedQuery<Record<string, unknown>>(queryExpenseDetails(tenantId, params), params);
  }

  async getBalanceDetails(
    tenantId: string,
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

    if (isAgroTenant(tenantId)) return [];
    return executeNamedQuery<Record<string, unknown>>(queryBalanceDetails(tenantId, params), params);
  }
}

function isAgroTenant(tenantId: string) {
  return String(tenantId).toLowerCase() === "agro";
}
