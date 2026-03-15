import { buildReportPeriod, ensureReportingTenantReady } from "../../../../shared/reporting/reporting.helpers.js";
import { CashflowRepository } from "./cashflow.repository.js";

export class CashflowService {
  constructor(private readonly repository = new CashflowRepository()) {}

  async dateFilters(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    const rows = await this.repository.getDateFilters();

    const dates = rows
      .map((row) => {
        const value = row.DATE_ ?? row.date_ ?? row.date ?? Object.values(row)[0];
        if (!value) return null;
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      })
      .filter((item): item is Date => item !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    const years = Array.from(new Set(dates.map((d) => d.getUTCFullYear()))).sort((a, b) => b - a);
    const months = Array.from(new Set(dates.map((d) => d.getUTCMonth() + 1))).sort((a, b) => a - b);
    const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

    return {
      years,
      months,
      minStartDate: dates.length ? toIsoDate(dates[0]) : null,
      maxEndDate: dates.length ? toIsoDate(dates[dates.length - 1]) : null
    };
  }

  async accounts(tenantId: string) {
    await ensureReportingTenantReady(tenantId);
    const rows = await this.repository.getAccounts();
    return rows
      .filter((row) => row.code)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async details(
    tenantId: string,
    filters?: {
      from?: string;
      to?: string;
      code?: string;
      clcode?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
      offset?: number;
      limit?: number;
    }
  ) {
    await ensureReportingTenantReady(tenantId);
    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getDetails({
      code: filters?.code,
      clcode: filters?.clcode,
      offset: filters?.offset,
      limit: filters?.limit,
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
    return {
      tenantId,
      report: "cashflow-details",
      period,
      paging: { offset: filters?.offset ?? 0, limit: filters?.limit ?? 50 },
      rows
    };
  }

  async totals(
    tenantId: string,
    filters?: {
      from?: string;
      to?: string;
      code?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    await ensureReportingTenantReady(tenantId);
    const code = String(filters?.code ?? "").trim();
    if (!code) {
      return {
        tenantId,
        report: "cashflow-totals",
        period: buildReportPeriod(filters?.from, filters?.to),
        cash: null,
        totals: { income: 0, outcome: 0, net: 0 },
        groups: []
      };
    }

    const period = buildReportPeriod(filters?.from, filters?.to);
    const rows = await this.repository.getTotals({
      code,
      year: filters?.year,
      month: filters?.month,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });

    const cashName = rows[0]?.cashName ?? code;
    const groupMap = new Map<
      string,
      {
        income: number;
        outcome: number;
        clients: Map<string, { code: string; name: string; income: number; outcome: number }>;
      }
    >();

    for (const row of rows) {
      const groupName = String(row.group || "BEYLEKILER").trim() || "BEYLEKILER";
      const clientKey = String(row.clientCode || row.clientName || "UNKNOWN").trim() || "UNKNOWN";
      const clientName = String(row.clientName || row.clientCode || "-").trim() || "-";
      const group = groupMap.get(groupName) ?? {
        income: 0,
        outcome: 0,
        clients: new Map<string, { code: string; name: string; income: number; outcome: number }>()
      };
      group.income += row.income;
      group.outcome += row.outcome;

      const client = group.clients.get(clientKey) ?? {
        code: row.clientCode,
        name: clientName,
        income: 0,
        outcome: 0
      };
      client.income += row.income;
      client.outcome += row.outcome;
      group.clients.set(clientKey, client);
      groupMap.set(groupName, group);
    }

    const groups = Array.from(groupMap.entries())
      .map(([group, value]) => ({
        group,
        income: value.income,
        outcome: value.outcome,
        net: value.income + value.outcome,
        clients: Array.from(value.clients.values())
          .map((client) => ({
            ...client,
            net: client.income + client.outcome
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.group.localeCompare(b.group));

    return {
      tenantId,
      report: "cashflow-totals",
      period,
      cash: { code, name: cashName },
      totals: {
        income: groups.reduce((acc, group) => acc + group.income, 0),
        outcome: groups.reduce((acc, group) => acc + group.outcome, 0),
        net: groups.reduce((acc, group) => acc + group.net, 0)
      },
      groups
    };
  }
}
