import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { resolveTenant } from "../../../lib/platform/tenant/resolve-tenant";
import {
  fetchBalanceBioTotals,
  fetchBalanceCreditTotals,
  fetchBalanceMaterialTotals,
  fetchBalanceTotals,
  fetchIncomeDateFilters
} from "../../../lib/platform/reporting/api";
import IncomeFiltersCard from "../../../components/income-filters-card";

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

export default async function BalanceSheetTotalsPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const rawQuery = (await searchParams) ?? {};
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const expandCash = rawQuery.expandCash === "1";
  const expandMaterial = rawQuery.expandMaterial === "1";
  const expandCredit = rawQuery.expandCredit === "1";
  const expandBio = rawQuery.expandBio === "1";
  const selectedGroup = rawQuery.group ? String(rawQuery.group) : "";
  const selectedCreditGroup = rawQuery.creditGroup ? String(rawQuery.creditGroup) : "";

  const [dateFilterData, totalsData, materialTotalsData, creditTotalsData, bioTotalsData] = await Promise.all([
    fetchIncomeDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    fetchBalanceTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    fetchBalanceMaterialTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    fetchBalanceCreditTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    fetchBalanceBioTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })
  ]);

  const rows = Array.isArray(totalsData?.lines) ? totalsData.lines : [];
  const totalTmt = rows.reduce((acc, row) => acc + Number(row.lineNet ?? row.amount ?? 0), 0);
  const totalUsd = rows.reduce((acc, row) => acc + Number(row.reportNet ?? 0), 0);
  const groupMap = new Map();
  rows.forEach((row) => {
    const group = String(row.group ?? "").trim() || "Other";
    const current = groupMap.get(group) ?? { lineNet: 0, reportNet: 0, rows: [] };
    current.lineNet += Number(row.lineNet ?? row.amount ?? 0);
    current.reportNet += Number(row.reportNet ?? 0);
    current.rows.push(row);
    groupMap.set(group, current);
  });
  const groups = Array.from(groupMap.entries()).map(([name, value]) => ({ name, ...value }));

  const materialRows = Array.isArray(materialTotalsData?.categories) ? materialTotalsData.categories : [];
  const materialTotalTmt = Number(materialTotalsData?.totals?.totalTmt ?? 0);
  const materialTotalUsd = Number(materialTotalsData?.totals?.totalUsd ?? 0);

  const creditRows = Array.isArray(creditTotalsData?.categories) ? creditTotalsData.categories : [];
  const creditTotalTmt = Number(creditTotalsData?.totals?.totalTmt ?? 0);
  const creditTotalUsd = Number(creditTotalsData?.totals?.totalUsd ?? 0);
  const creditGroupMap = new Map();
  creditRows.forEach((row) => {
    const group = String(row.group ?? "").trim() || "BEYLEKILER";
    const current = creditGroupMap.get(group) ?? { lineNet: 0, reportNet: 0, rows: [] };
    current.lineNet += Number(row.lineNet ?? row.amount ?? 0);
    current.reportNet += Number(row.reportNet ?? 0);
    current.rows.push(row);
    creditGroupMap.set(group, current);
  });
  const creditGroups = Array.from(creditGroupMap.entries()).map(([name, value]) => ({ name, ...value }));
  const bioRows = Array.isArray(bioTotalsData?.categories) ? bioTotalsData.categories : [];
  const bioTotalTmt = Number(bioTotalsData?.totals?.totalTmt ?? 0);
  const bioTotalUsd = Number(bioTotalsData?.totals?.totalUsd ?? 0);

  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const hasAnyRows = rows.length > 0 || materialRows.length > 0 || creditRows.length > 0 || bioRows.length > 0;

  return (
    <div className="layout-grid income-layout-grid income-totals-layout">
      <div>
        <div className="panel income-panel">
          <div className="panel-title income-panel-title">
            <div className="income-title-client">BALANS HASABATY</div>
          </div>
          <table className="income-table balance-totals-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}></th>
                <th>TMT</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {!hasAnyRows ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#64748b" }}>
                    No data
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "" : "1",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandCash ? "▾" : "▸"}</span>
                        PUL SERISDESI
                      </Link>
                    </td>
                    <td>{money(totalTmt)}</td>
                    <td>{money(totalUsd)}</td>
                  </tr>

                  {expandCash
                    ? groups.map((group) => (
                        <Fragment key={`group-wrap-${group.name}`}>
                          <tr key={`group-${group.name}`} className="row-expense balance-group-row">
                            <td style={{ textAlign: "left" }}>
                              <Link
                                href={`/${tenantId}/balance-sheet?${buildQuery({
                                  expandCash: "1",
                                  expandMaterial: expandMaterial ? "1" : "",
                                  expandCredit: expandCredit ? "1" : "",
                                  expandBio: expandBio ? "1" : "",
                                  creditGroup: selectedCreditGroup || "",
                                  group: selectedGroup === group.name ? "" : group.name,
                                  year,
                                  month,
                                  startDate,
                                  endDate
                                })}`}
                                className="income-category-link balance-level-link balance-level-group"
                              >
                                <span className="balance-level-indicator">{selectedGroup === group.name ? "▾" : "▸"}</span>
                                {group.name}
                              </Link>
                            </td>
                            <td>{money(group.lineNet)}</td>
                            <td>{money(group.reportNet)}</td>
                          </tr>
                          {selectedGroup === group.name
                            ? group.rows.map((row, idx) => {
                                const category = String(row.code ?? idx + 1);
                                const detailsQuery = buildQuery({ category, year, month, startDate, endDate });
                                return (
                                  <tr key={`${group.name}-${category}-${idx}`} className="income-category-row balance-name-row">
                                    <td style={{ textAlign: "left" }}>
                                      <Link
                                        href={`/${tenantId}/balance-sheet/details?${detailsQuery}`}
                                        className="income-category-link balance-level-link balance-level-name"
                                      >
                                        {String(row.label ?? "-")}
                                      </Link>
                                    </td>
                                    <td>{money(row.lineNet ?? row.amount)}</td>
                                    <td>{money(row.reportNet)}</td>
                                  </tr>
                                );
                              })
                            : null}
                        </Fragment>
                      ))
                    : null}

                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "" : "1",
                          expandCredit: expandCredit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandMaterial ? "▾" : "▸"}</span>
                      MATERIALLAR
                    </Link>
                  </td>
                  <td>{money(materialTotalTmt)}</td>
                  <td>{money(materialTotalUsd)}</td>
                </tr>

                  {expandMaterial
                    ? materialRows.map((row, idx) => (
                        <tr key={`mat-${idx}`} className="income-category-row balance-name-row">
                          <td style={{ textAlign: "left" }}>
                            <Link
                              href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                kind: "material",
                                category: String(row.code ?? idx + 1),
                                year,
                                month,
                                startDate,
                                endDate
                              })}`}
                              className="income-category-link balance-level-link balance-level-name"
                            >
                              {String(row.label ?? "-")}
                            </Link>
                          </td>
                          <td>{money(row.lineNet ?? row.amount)}</td>
                          <td>{money(row.reportNet)}</td>
                        </tr>
                      ))
                    : null}

                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandBio: expandBio ? "" : "1",
                          creditGroup: selectedCreditGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandBio ? "▾" : "▸"}</span>
                        BIO AKTIWLER
                      </Link>
                    </td>
                    <td>{money(bioTotalTmt)}</td>
                    <td>{money(bioTotalUsd)}</td>
                  </tr>

                  {expandBio
                    ? bioRows.map((row, idx) => (
                        <tr key={`bio-${idx}`} className="income-category-row balance-name-row">
                          <td style={{ textAlign: "left" }}>
                            <Link
                              href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                kind: "bio",
                                category: String(row.code ?? idx + 1),
                                year,
                                month,
                                startDate,
                                endDate
                              })}`}
                              className="income-category-link balance-level-link balance-level-name"
                            >
                              {String(row.label ?? "-")}
                            </Link>
                          </td>
                          <td>{money(row.lineNet ?? row.amount)}</td>
                          <td>{money(row.reportNet)}</td>
                        </tr>
                      ))
                    : null}

                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "" : "1",
                          expandBio: expandBio ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandCredit ? "▾" : "▸"}</span>
                        ALGYLARYMYZ
                      </Link>
                    </td>
                    <td>{money(creditTotalTmt)}</td>
                    <td>{money(creditTotalUsd)}</td>
                  </tr>

                  {expandCredit
                    ? creditGroups.map((group) => (
                        <Fragment key={`credit-group-wrap-${group.name}`}>
                          <tr key={`credit-group-${group.name}`} className="row-expense balance-group-row">
                            <td style={{ textAlign: "left" }}>
                              <Link
                                href={`/${tenantId}/balance-sheet?${buildQuery({
                                  expandCash: expandCash ? "1" : "",
                                  group: selectedGroup || "",
                                  expandMaterial: expandMaterial ? "1" : "",
                                  expandCredit: "1",
                                  expandBio: expandBio ? "1" : "",
                                  creditGroup: selectedCreditGroup === group.name ? "" : group.name,
                                  year,
                                  month,
                                  startDate,
                                  endDate
                                })}`}
                                className="income-category-link balance-level-link balance-level-group"
                              >
                                <span className="balance-level-indicator">{selectedCreditGroup === group.name ? "▾" : "▸"}</span>
                                {group.name}
                              </Link>
                            </td>
                            <td>{money(group.lineNet)}</td>
                            <td>{money(group.reportNet)}</td>
                          </tr>
                          {selectedCreditGroup === group.name
                            ? group.rows.map((row, idx) => (
                                <tr key={`credit-name-${group.name}-${idx}`} className="income-category-row balance-name-row">
                                  <td style={{ textAlign: "left" }}>
                                    <Link
                                      href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                        kind: "credit",
                                        category: String(row.code ?? ""),
                                        year,
                                        month,
                                        startDate,
                                        endDate
                                      })}`}
                                      className="income-category-link balance-level-link balance-level-name"
                                    >
                                      {String(row.label ?? "-")}
                                    </Link>
                                  </td>
                                  <td>{money(row.lineNet ?? row.amount)}</td>
                                  <td>{money(row.reportNet)}</td>
                                </tr>
                              ))
                            : null}
                        </Fragment>
                      ))
                    : null}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncomeFiltersCard
        title="▽ Filters"
        showClient={false}
        month={month}
        year={year}
        startDate={startDate}
        endDate={endDate}
        clients={[]}
        months={months}
        years={years}
      />
    </div>
  );
}
