import { Fragment } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import IncomeFiltersCard from "../../../components/income-filters-card";
import { resolveTenant } from "../../../lib/platform/tenant/resolve-tenant";
import { fetchCashflowAccounts, fetchCashflowDateFilters, fetchCashflowTotals } from "../../../lib/platform/reporting/api";

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    const text = String(value).trim();
    if (!text) return;
    qs.set(key, text);
  });
  return qs.toString();
}

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DEFAULT_CASHFLOW_CODE = "100.10";

export default async function CashflowPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();
  if (tenant.id !== "maksat-deri") notFound();

  const rawQuery = (await searchParams) ?? {};
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const expandedGroup = rawQuery.group ? String(rawQuery.group) : "";

  const [dateFilterData, cashAccountsData] = await Promise.all([
    fetchCashflowDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    fetchCashflowAccounts(tenantId).catch(() => [])
  ]);

  const rawCashAccounts = (Array.isArray(cashAccountsData) ? cashAccountsData : [])
    .map((row) => ({
      code: String(row.code ?? "").trim(),
      name: String(row.name ?? row.code ?? "").trim()
    }))
    .filter((row) => {
      const name = row.name.toUpperCase();
      return !name.includes("BANK");
    })
    .filter((row) => row.code);
  const cashAccounts = rawCashAccounts;
  const requestedCode = rawQuery.code ? String(rawQuery.code) : "";
  const hasRequestedCode = cashAccounts.some((row) => row.code === requestedCode);
  const defaultCode = cashAccounts.some((row) => row.code === DEFAULT_CASHFLOW_CODE)
    ? DEFAULT_CASHFLOW_CODE
    : cashAccounts[0]?.code ?? "";
  const code = hasRequestedCode ? requestedCode : defaultCode;

  if (code && requestedCode !== code) {
    redirect(
      `/${tenantId}/cashflow?${buildQuery({
        code,
        year,
        month,
        startDate,
        endDate
      })}`
    );
  }

  const cashflowData = code
    ? await fetchCashflowTotals(tenantId, {
        code,
        year: year || undefined,
        month: month || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }).catch(() => ({ totals: { income: 0, outcome: 0, net: 0 }, groups: [], cash: null }))
    : { totals: { income: 0, outcome: 0, net: 0 }, groups: [], cash: null };

  const groups = Array.isArray(cashflowData?.groups) ? cashflowData.groups : [];
  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const hasRows = groups.length > 0;
  const cashTitle = String(cashflowData?.cash?.name ?? code ?? "CASHFLOW").toUpperCase();

  return (
    <div className="layout-grid income-layout-grid income-totals-layout">
      <div>
        <div className="panel income-panel">
          <div className="panel-title income-panel-title">
            <div className="income-title-client">{cashTitle}</div>
          </div>
          <table className="income-table balance-totals-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}></th>
                <th style={{ textAlign: "right" }}>Income</th>
                <th style={{ textAlign: "right" }}>Outcome</th>
                <th style={{ textAlign: "center" }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {!hasRows ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#64748b" }}>
                    No data
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}></td>
                    <td>{money(cashflowData?.totals?.income)}</td>
                    <td>{money(cashflowData?.totals?.outcome)}</td>
                    <td style={{ textAlign: "right" }}>{money(cashflowData?.totals?.net)}</td>
                  </tr>
                  {groups.map((group) => {
                    const isExpanded = expandedGroup === group.group;
                    const groupQuery = buildQuery({
                      code,
                      group: isExpanded ? "" : group.group,
                      year,
                      month,
                      startDate,
                      endDate
                    });
                    return (
                      <Fragment key={group.group}>
                        <tr className="income-category-row">
                          <td style={{ textAlign: "left" }}>
                            <Link href={`/${tenantId}/cashflow?${groupQuery}`} className="income-category-link balance-level-link">
                              <span className="balance-level-indicator">{isExpanded ? "▾" : "▸"}</span>
                              {group.group}
                            </Link>
                          </td>
                          <td>{money(group.income)}</td>
                          <td>{money(group.outcome)}</td>
                          <td style={{ textAlign: "right" }}>{money(group.net)}</td>
                        </tr>
                        {isExpanded
                          ? group.clients.map((client, idx) => (
                              <tr key={`${group.group}-${client.code || idx}`} className="income-category-row">
                                <td style={{ textAlign: "left", paddingLeft: 28 }}>
                                  {client.code ? (
                                    <Link
                                      href={`/${tenantId}/cashflow/details?${buildQuery({
                                        code,
                                        clcode: client.code,
                                        year,
                                        month,
                                        startDate,
                                        endDate
                                      })}`}
                                      className="income-category-link"
                                    >
                                      <span className="dot"></span>
                                      {client.name || client.code || "-"}
                                    </Link>
                                  ) : (
                                    <>
                                      <span className="dot"></span>
                                      {client.name || client.code || "-"}
                                    </>
                                  )}
                                </td>
                                <td>{money(client.income)}</td>
                                <td>{money(client.outcome)}</td>
                                <td style={{ textAlign: "right" }}>{money(client.net)}</td>
                              </tr>
                            ))
                          : null}
                      </Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncomeFiltersCard
        title="Cashflow Filters"
        code={code}
        clients={cashAccounts}
        years={years}
        months={months}
        year={year}
        month={month}
        startDate={startDate}
        endDate={endDate}
        extraParams={{ group: expandedGroup }}
      />
    </div>
  );
}
