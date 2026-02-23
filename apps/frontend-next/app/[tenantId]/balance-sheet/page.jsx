import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { resolveTenant } from "../../../lib/platform/tenant/resolve-tenant";
import {
  fetchBalanceAdvanceTotals,
  fetchBalanceBioTotals,
  fetchBalanceCreditTotals,
  fetchBalanceDebitTotals,
  fetchBalanceIntangibleTotals,
  fetchBalanceLoanTotals,
  fetchBalanceMaterialTotals,
  fetchBalanceShareTotals,
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
  const isAgro = tenant.id === "agro";

  const rawQuery = (await searchParams) ?? {};
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const expandCash = rawQuery.expandCash === "1";
  const expandMaterial = rawQuery.expandMaterial === "1";
  const expandCredit = rawQuery.expandCredit === "1";
  const expandDebit = rawQuery.expandDebit === "1";
  const expandBio = rawQuery.expandBio === "1";
  const expandLoan = rawQuery.expandLoan === "1";
  const expandAdvance = rawQuery.expandAdvance === "1";
  const expandIntangible = rawQuery.expandIntangible === "1";
  const expandShare = rawQuery.expandShare === "1";
  const selectedGroup = rawQuery.group ? String(rawQuery.group) : "";
  const selectedCreditGroup = rawQuery.creditGroup ? String(rawQuery.creditGroup) : "";
  const selectedDebitGroup = rawQuery.debitGroup ? String(rawQuery.debitGroup) : "";
  const selectedShareGroup = rawQuery.shareGroup ? String(rawQuery.shareGroup) : "";

  const [dateFilterData, totalsData, materialTotalsData, creditTotalsData, debitTotalsData, bioTotalsData, loanTotalsData, advanceTotalsData, intangibleTotalsData, shareTotalsData] = await Promise.all([
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
    fetchBalanceDebitTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    isAgro
      ? Promise.resolve({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] })
      : fetchBalanceBioTotals(tenantId, {
          year: year || undefined,
          month: month || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }),
    isAgro
      ? Promise.resolve({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] })
      : fetchBalanceLoanTotals(tenantId, {
          year: year || undefined,
          month: month || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }),
    fetchBalanceAdvanceTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    isAgro
      ? Promise.resolve({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] })
      : fetchBalanceIntangibleTotals(tenantId, {
          year: year || undefined,
          month: month || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }),
    isAgro
      ? Promise.resolve({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] })
      : fetchBalanceShareTotals(tenantId, {
          year: year || undefined,
          month: month || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }).catch(() => ({ totals: { totalTmt: 0, totalUsd: 0 }, categories: [] }))
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
  const debitRows = Array.isArray(debitTotalsData?.categories) ? debitTotalsData.categories : [];
  const debitTotalTmt = Number(debitTotalsData?.totals?.totalTmt ?? 0);
  const debitTotalUsd = Number(debitTotalsData?.totals?.totalUsd ?? 0);
  const debitGroupMap = new Map();
  debitRows.forEach((row) => {
    const group = String(row.group ?? "").trim() || "BEYLEKILER";
    const current = debitGroupMap.get(group) ?? { lineNet: 0, reportNet: 0, rows: [] };
    current.lineNet += Number(row.lineNet ?? row.amount ?? 0);
    current.reportNet += Number(row.reportNet ?? 0);
    current.rows.push(row);
    debitGroupMap.set(group, current);
  });
  const debitGroups = Array.from(debitGroupMap.entries()).map(([name, value]) => ({ name, ...value }));
  const bioRows = Array.isArray(bioTotalsData?.categories) ? bioTotalsData.categories : [];
  const bioTotalTmt = Number(bioTotalsData?.totals?.totalTmt ?? 0);
  const bioTotalUsd = Number(bioTotalsData?.totals?.totalUsd ?? 0);
  const loanRows = Array.isArray(loanTotalsData?.categories) ? loanTotalsData.categories : [];
  const loanTotalTmt = Number(loanTotalsData?.totals?.totalTmt ?? 0);
  const loanTotalUsd = Number(loanTotalsData?.totals?.totalUsd ?? 0);
  const advanceRows = Array.isArray(advanceTotalsData?.categories) ? advanceTotalsData.categories : [];
  const advanceTotalTmt = Number(advanceTotalsData?.totals?.totalTmt ?? 0);
  const advanceTotalUsd = Number(advanceTotalsData?.totals?.totalUsd ?? 0);
  const intangibleRows = Array.isArray(intangibleTotalsData?.categories) ? intangibleTotalsData.categories : [];
  const intangibleTotalTmt = Number(intangibleTotalsData?.totals?.totalTmt ?? 0);
  const intangibleTotalUsd = Number(intangibleTotalsData?.totals?.totalUsd ?? 0);
  const shareRows = Array.isArray(shareTotalsData?.categories) ? shareTotalsData.categories : [];
  const shareTotalTmt = Number(shareTotalsData?.totals?.totalTmt ?? 0);
  const shareTotalUsd = Number(shareTotalsData?.totals?.totalUsd ?? 0);
  const shareGroupMap = new Map();
  shareRows.forEach((row) => {
    const group = String(row.group ?? "").trim() || "PAYNAMALAR";
    const current = shareGroupMap.get(group) ?? { lineNet: 0, reportNet: 0, rows: [] };
    current.lineNet += Number(row.lineNet ?? row.amount ?? 0);
    current.reportNet += Number(row.reportNet ?? 0);
    current.rows.push(row);
    shareGroupMap.set(group, current);
  });
  const shareGroups = Array.from(shareGroupMap.entries()).map(([name, value]) => ({ name, ...value }));

  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const hasAnyRows =
    rows.length > 0 ||
    materialRows.length > 0 ||
    creditRows.length > 0 ||
    debitRows.length > 0 ||
    bioRows.length > 0 ||
    loanRows.length > 0 ||
    advanceRows.length > 0 ||
    intangibleRows.length > 0 ||
    shareRows.length > 0;

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
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
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
                          expandDebit: expandDebit ? "1" : "",
                                  expandBio: expandBio ? "1" : "",
                                  expandLoan: expandLoan ? "1" : "",
                                  expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                                  creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
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
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
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

                  {!isAgro ? <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "" : "1",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
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
                  </tr> : null}

                  {!isAgro && expandBio
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

                  {!isAgro ? <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "" : "1",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandLoan ? "▾" : "▸"}</span>
                        BANK KARZLAR
                      </Link>
                    </td>
                    <td>{money(loanTotalTmt)}</td>
                    <td>{money(loanTotalUsd)}</td>
                  </tr> : null}

                  {!isAgro && expandLoan
                    ? loanRows.map((row, idx) => (
                        <tr key={`loan-${idx}`} className="income-category-row balance-name-row">
                          <td style={{ textAlign: "left" }}>
                            <Link
                              href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                kind: "loan",
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
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "" : "1",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandAdvance ? "▾" : "▸"}</span>
                        IS AWANSLAR
                      </Link>
                    </td>
                    <td>{money(advanceTotalTmt)}</td>
                    <td>{money(advanceTotalUsd)}</td>
                  </tr>

                  {expandAdvance
                    ? advanceRows.map((row, idx) => (
                        <tr key={`advance-${idx}`} className="income-category-row balance-name-row">
                          <td style={{ textAlign: "left" }}>
                            <Link
                              href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                kind: "advance",
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

                  {!isAgro ? <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "" : "1",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandIntangible ? "▾" : "▸"}</span>
                        MADDY DALLER
                      </Link>
                    </td>
                    <td>{money(intangibleTotalTmt)}</td>
                    <td>{money(intangibleTotalUsd)}</td>
                  </tr> : null}

                  {!isAgro && expandIntangible
                    ? intangibleRows.map((row, idx) => (
                        <tr key={`intangible-${idx}`} className="income-category-row balance-name-row">
                          <td style={{ textAlign: "left" }}>
                            <Link
                              href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                kind: "intangible",
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
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
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
                                  expandDebit: expandDebit ? "1" : "",
                                  expandBio: expandBio ? "1" : "",
                                  expandLoan: expandLoan ? "1" : "",
                                  expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                                  creditGroup: selectedCreditGroup === group.name ? "" : group.name,
                                  debitGroup: selectedDebitGroup || "",
                                  shareGroup: selectedShareGroup || "",
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

                  <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "" : "1",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "1" : "",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandDebit ? "▾" : "▸"}</span>
                        BERGILERIMIZ
                      </Link>
                    </td>
                    <td>{money(debitTotalTmt)}</td>
                    <td>{money(debitTotalUsd)}</td>
                  </tr>

                  {expandDebit
                    ? debitGroups.map((group) => (
                        <Fragment key={`debit-group-wrap-${group.name}`}>
                          <tr key={`debit-group-${group.name}`} className="row-expense balance-group-row">
                            <td style={{ textAlign: "left" }}>
                              <Link
                                href={`/${tenantId}/balance-sheet?${buildQuery({
                                  expandCash: expandCash ? "1" : "",
                                  group: selectedGroup || "",
                                  expandMaterial: expandMaterial ? "1" : "",
                                  expandCredit: expandCredit ? "1" : "",
                                  expandDebit: "1",
                                  expandBio: expandBio ? "1" : "",
                                  expandLoan: expandLoan ? "1" : "",
                                  expandAdvance: expandAdvance ? "1" : "",
                                  expandIntangible: expandIntangible ? "1" : "",
                                  expandShare: expandShare ? "1" : "",
                                  creditGroup: selectedCreditGroup || "",
                                  debitGroup: selectedDebitGroup === group.name ? "" : group.name,
                                  shareGroup: selectedShareGroup || "",
                                  year,
                                  month,
                                  startDate,
                                  endDate
                                })}`}
                                className="income-category-link balance-level-link balance-level-group"
                              >
                                <span className="balance-level-indicator">{selectedDebitGroup === group.name ? "▾" : "▸"}</span>
                                {group.name}
                              </Link>
                            </td>
                            <td>{money(group.lineNet)}</td>
                            <td>{money(group.reportNet)}</td>
                          </tr>
                          {selectedDebitGroup === group.name
                            ? group.rows.map((row, idx) => (
                                <tr key={`debit-name-${group.name}-${idx}`} className="income-category-row balance-name-row">
                                  <td style={{ textAlign: "left" }}>
                                    <Link
                                      href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                        kind: "debit",
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

                  {!isAgro ? <tr className="income-main-total-row balance-category-row">
                    <td style={{ textAlign: "left" }}>
                      <Link
                        href={`/${tenantId}/balance-sheet?${buildQuery({
                          expandCash: expandCash ? "1" : "",
                          group: selectedGroup || "",
                          expandMaterial: expandMaterial ? "1" : "",
                          expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "1" : "",
                          expandBio: expandBio ? "1" : "",
                          expandLoan: expandLoan ? "1" : "",
                          expandAdvance: expandAdvance ? "1" : "",
                          expandIntangible: expandIntangible ? "1" : "",
                          expandShare: expandShare ? "" : "1",
                          creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                          shareGroup: selectedShareGroup || "",
                          year,
                          month,
                          startDate,
                          endDate
                        })}`}
                        className="income-category-link balance-level-link balance-level-category"
                      >
                        <span className="balance-level-indicator">{expandShare ? "▾" : "▸"}</span>
                        HISSE SENEDI
                      </Link>
                    </td>
                    <td>{money(shareTotalTmt)}</td>
                    <td>{money(shareTotalUsd)}</td>
                  </tr> : null}

                  {!isAgro && expandShare
                    ? shareGroups.map((group) => (
                        <Fragment key={`share-group-wrap-${group.name}`}>
                          <tr key={`share-group-${group.name}`} className="row-expense balance-group-row">
                            <td style={{ textAlign: "left" }}>
                              <Link
                                href={`/${tenantId}/balance-sheet?${buildQuery({
                                  expandCash: expandCash ? "1" : "",
                                  group: selectedGroup || "",
                                  expandMaterial: expandMaterial ? "1" : "",
                                  expandCredit: expandCredit ? "1" : "",
                          expandDebit: expandDebit ? "1" : "",
                                  expandBio: expandBio ? "1" : "",
                                  expandLoan: expandLoan ? "1" : "",
                                  expandAdvance: expandAdvance ? "1" : "",
                                  expandIntangible: expandIntangible ? "1" : "",
                                  expandShare: "1",
                                  creditGroup: selectedCreditGroup || "",
                          debitGroup: selectedDebitGroup || "",
                                  shareGroup: selectedShareGroup === group.name ? "" : group.name,
                                  year,
                                  month,
                                  startDate,
                                  endDate
                                })}`}
                                className="income-category-link balance-level-link balance-level-group"
                              >
                                <span className="balance-level-indicator">{selectedShareGroup === group.name ? "▾" : "▸"}</span>
                                {group.name}
                              </Link>
                            </td>
                            <td>{money(group.lineNet)}</td>
                            <td>{money(group.reportNet)}</td>
                          </tr>
                          {selectedShareGroup === group.name
                            ? group.rows.map((row, idx) => (
                                <tr key={`share-name-${group.name}-${idx}`} className="income-category-row balance-name-row">
                                  <td style={{ textAlign: "left" }}>
                                    <Link
                                      href={`/${tenantId}/balance-sheet/details?${buildQuery({
                                        kind: "share",
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
