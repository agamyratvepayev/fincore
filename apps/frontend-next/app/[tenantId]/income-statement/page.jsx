import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenant } from "../../../lib/platform/tenant/resolve-tenant";
import {
  fetchIncomeBalanceTotals,
  fetchIncomeClients,
  fetchIncomeDetails,
  fetchIncomeDateFilters,
  fetchIncomeExpenseTotals,
  fetchIncomeRevenueTotals
} from "../../../lib/platform/reporting/api";
import IncomeFiltersCard from "../../../components/income-filters-card";

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toCategoryId(value, fallback) {
  const text = String(value ?? "").trim();
  return text || String(fallback);
}

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

export default async function IncomeStatementTotalsPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const rawQuery = (await searchParams) ?? {};
  const isAgro = tenantId === "agro";
  const isYupluk = tenantId === "yupluk";
  const isAgroLike = isAgro || isYupluk;
  const isGurlusyk = tenantId === "gurlusyk";
  const isMaksatDeri = tenantId === "maksat-deri";
  const usesClientCode = isGurlusyk;
  const defaultClientCode = "120.05.001";
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const code = usesClientCode ? (rawQuery.code ? String(rawQuery.code) : defaultClientCode) : "";

  const [dateFilterData, clientsData, revenueData, expenseData, balanceData] = await Promise.all([
    fetchIncomeDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    usesClientCode ? fetchIncomeClients(tenantId).catch(() => []) : Promise.resolve([]),
    fetchIncomeRevenueTotals(tenantId, {
      code: usesClientCode ? code || undefined : undefined,
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).catch((error) => {
      console.error(`[income-statement] revenue totals failed for tenant=${tenantId}`, error);
      return { totals: { totalTmt: 0, totalUsd: 0 }, categories: [] };
    }),
    fetchIncomeExpenseTotals(tenantId, {
      code: usesClientCode ? code || undefined : undefined,
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).catch((error) => {
      console.error(`[income-statement] expense totals failed for tenant=${tenantId}`, error);
      return { totals: { totalTmt: 0, totalUsd: 0 }, categories: [] };
    }),
    isGurlusyk
      ? fetchIncomeBalanceTotals(tenantId, {
          code: code || undefined,
          year: year || undefined,
          month: month || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        })
      : Promise.resolve({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] })
  ]);

  const revenueCategoriesRaw = Array.isArray(revenueData?.categories) ? revenueData.categories : [];
  const revenueCategories = isMaksatDeri
    ? [...revenueCategoriesRaw].sort((a, b) => {
        const rank = (name) => {
          const key = String(name ?? "").trim().toUpperCase();
          if (key === "SATYSLAR") return 0;
          if (key === "HYZMATLAR") return 1;
          return 2;
        };
        return rank(a?.name) - rank(b?.name);
      })
    : revenueCategoriesRaw;
  const expenseCategories = Array.isArray(expenseData?.categories) ? expenseData.categories : [];
  const revenueTotalTmt = Number(revenueData?.totals?.totalTmt ?? 0);
  const revenueTotalUsd = Number(revenueData?.totals?.totalUsd ?? 0);
  const expenseTotalTmt = Number(expenseData?.totals?.totalTmt ?? 0);
  const expenseTotalUsd = Number(expenseData?.totals?.totalUsd ?? 0);
  const profitTotalTmt = revenueTotalTmt - expenseTotalTmt;
  const profitTotalUsd = revenueTotalUsd - expenseTotalUsd;
  const rawBalanceCategories = Array.isArray(balanceData?.categories) ? balanceData.categories : [];
  const detailsFetchLimit = 999999999;
  const balanceCategories = isGurlusyk
    ? await Promise.all(
        rawBalanceCategories.map(async (row, idx) => {
          const id = toNumber(row?.id, idx + 1);
          const detailsData = await fetchIncomeDetails(tenantId, "balance", {
            category: id,
            code: code || undefined,
            year: year || undefined,
            month: month || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            offset: 0,
            limit: detailsFetchLimit
          }).catch(() => ({ rows: [] }));
          const detailRows = Array.isArray(detailsData?.rows) ? detailsData.rows : [];
          const lineNet = detailRows.reduce((acc, detailRow) => acc + Number(detailRow.LINENET ?? detailRow.linenet ?? 0), 0);
          const reportNet = detailRows.reduce(
            (acc, detailRow) => acc + Number(detailRow.REPORTNET ?? detailRow.reportnet ?? 0),
            0
          );
          return {
            ...row,
            id,
            lineNet,
            reportNet
          };
        })
      )
    : rawBalanceCategories;
  const balanceTotalTmt = balanceCategories.reduce((acc, row) => acc + Number(row?.lineNet ?? 0), 0);
  const balanceTotalUsd = balanceCategories.reduce((acc, row) => acc + Number(row?.reportNet ?? 0), 0);
  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const clients = Array.isArray(clientsData) ? clientsData : [];
  const selectedClient = clients.find((client) => String(client.code ?? "").trim() === code) ?? null;
  const selectedClientName = String(
    selectedClient?.name ?? selectedClient?.code ?? (isAgroLike ? tenant.name : code)
  ).trim();

  return (
    <div className="layout-grid income-layout-grid income-totals-layout">
      <div>
        <div className="panel income-panel">
          <div className="panel-title income-panel-title">
            <div className="income-title-client">{(selectedClientName || code).toUpperCase()}</div>
          </div>
          <table className="income-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}></th>
                <th>TMT</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {revenueCategories.length === 0 && expenseCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#64748b" }}>
                    No data
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="income-main-total-row">
                    <td style={{ textAlign: "left" }}>Girdeji</td>
                    <td>{money(revenueTotalTmt)}</td>
                    <td>{money(revenueTotalUsd)}</td>
                  </tr>
                  {revenueCategories.map((row, idx) => {
                    const id = isAgroLike ? toCategoryId(row.id ?? row.name, idx + 1) : toNumber(row.id, idx + 1);
                    const isGymmatyRow = isAgroLike && String(row.id ?? "").toUpperCase() === "GYMMATY";
                    const detailsQuery = buildQuery({
                      kind: "revenue",
                      category: isGymmatyRow ? "2" : id,
                      gymmaty: isGymmatyRow ? "1" : "",
                      code: usesClientCode ? code : "",
                      year,
                      month,
                      startDate,
                      endDate
                    });
                    return (
                      <tr key={`${id}-${idx}`} className="income-category-row">
                        <td style={{ textAlign: "left" }}>
                          <Link href={`/${tenantId}/income-statement/details?${detailsQuery}`} className="income-category-link">
                            <span className="dot"></span>
                            {row.name || "-"}
                          </Link>
                        </td>
                        <td>{money(row.lineNet)}</td>
                        <td>{money(row.reportNet)}</td>
                      </tr>
                    );
                  })}
                  <tr className="row-expense">
                    <td style={{ textAlign: "left" }}>Cykdajy</td>
                    <td>{money(expenseTotalTmt)}</td>
                    <td>{money(expenseTotalUsd)}</td>
                  </tr>
                  {expenseCategories.map((row, idx) => {
                    const id = toNumber(row.id, idx + 1);
                    const expenseCategory = isAgroLike ? String(row.name ?? id) : id;
                    const detailsQuery = buildQuery({
                      kind: "expense",
                      category: expenseCategory,
                      code: usesClientCode ? code : "",
                      year,
                      month,
                      startDate,
                      endDate
                    });
                    return (
                      <tr key={`expense-${id}-${idx}`} className="income-category-row">
                        <td style={{ textAlign: "left" }}>
                          <Link href={`/${tenantId}/income-statement/details?${detailsQuery}`} className="income-category-link">
                            <span className="dot red"></span>
                            {row.name || "-"}
                          </Link>
                        </td>
                        <td>{money(row.lineNet)}</td>
                        <td>{money(row.reportNet)}</td>
                      </tr>
                    );
                  })}
                  <tr className="row-profit">
                    <td style={{ textAlign: "left" }}>Peyda</td>
                    <td>{money(profitTotalTmt)}</td>
                    <td>{money(profitTotalUsd)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {isGurlusyk ? (
          <div className="panel income-panel" style={{ marginTop: 16 }}>
            <div className="panel-title income-panel-title">
              <div className="income-title-client">ALGY-BERGI</div>
            </div>
            <table className="income-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}></th>
                  <th>TMT</th>
                  <th>USD</th>
                </tr>
              </thead>
              <tbody>
                {balanceCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#64748b" }}>
                      No balance data
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className="income-main-total-row">
                      <td style={{ textAlign: "left" }}>Total Balance</td>
                      <td>{money(balanceTotalTmt)}</td>
                      <td>{money(balanceTotalUsd)}</td>
                    </tr>
                    {balanceCategories.map((row, idx) => {
                      const id = toNumber(row.id, idx + 1);
                      const detailsQuery = buildQuery({
                        kind: "balance",
                        category: id,
                        code,
                        year,
                        month,
                        startDate,
                        endDate
                      });
                      return (
                        <tr key={`balance-${id}-${idx}`} className="income-category-row">
                          <td style={{ textAlign: "left" }}>
                            <Link href={`/${tenantId}/income-statement/details?${detailsQuery}`} className="income-category-link">
                              <span className="dot yellow"></span>
                              {row.name || "-"}
                            </Link>
                          </td>
                          <td>{money(row.lineNet)}</td>
                          <td>{money(row.reportNet)}</td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <IncomeFiltersCard
        title="▽ Filters"
        code={code}
        month={month}
        year={year}
        startDate={startDate}
        endDate={endDate}
        clients={clients}
        months={months}
        years={years}
        showClient={usesClientCode}
      />
    </div>
  );
}
