import type { BalanceDetailsFilters, DateRangeFilters, IncomeDetailsFilters } from "./dto.js";
import type { ReportResponse } from "../../../shared/reporting/reporting.types.js";

export interface IncomeReportingProvider {
  dateFilters(tenantId: string): Promise<unknown>;
  clients(tenantId: string): Promise<unknown>;
  execute(tenantId: string, from?: string, to?: string): Promise<ReportResponse>;
  revenueTotals(tenantId: string, filters?: DateRangeFilters): Promise<unknown>;
  expenseTotals(tenantId: string, filters?: DateRangeFilters): Promise<unknown>;
  balanceTotals(tenantId: string, filters?: DateRangeFilters): Promise<unknown>;
  details(
    tenantId: string,
    kind: "revenue" | "expense" | "balance",
    from?: string,
    to?: string,
    clientCode?: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string,
    category?: string,
    offset?: number,
    limit?: number
  ): Promise<unknown>;
}

export interface BalanceReportingProvider {
  execute(tenantId: string, filters?: DateRangeFilters): Promise<ReportResponse>;
  details(tenantId: string, filters?: BalanceDetailsFilters): Promise<unknown>;
}

export interface TenantReportingProvider {
  readonly tenantId: string;
  readonly income: IncomeReportingProvider;
  readonly balance: BalanceReportingProvider;
}
