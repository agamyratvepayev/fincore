import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenant } from "../../../../lib/platform/tenant/resolve-tenant";
import {
  fetchBalanceCreditTotals,
  fetchBalanceDetails,
  fetchBalanceMaterialTotals,
  fetchBalanceTotals,
  fetchIncomeDateFilters
} from "../../../../lib/platform/reporting/api";
import IncomeFiltersCard from "../../../../components/income-filters-card";

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function isoDate(value) {
  if (!value) return "-";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString().slice(0, 10);
}

function normalizeType(row) {
  return String(row?.TYPE_ ?? row?.type_ ?? row?.TYPE ?? row?.type ?? "").trim();
}

function detailTmtValue(row, kind) {
  if (kind === "material") return Number(row.OUTCOST ?? row.outcost ?? 0);
  return Number(row.AMOUNT ?? row.amount ?? row.OUTCOST ?? row.outcost ?? 0);
}

function detailUsdValue(row, kind) {
  if (kind === "material") return Number(row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0);
  return Number(row.REPORTNET ?? row.reportnet ?? row.OUTCOSTCURR ?? row.outcostcurr ?? row.OUTCOSTCUR ?? row.outcostcur ?? 0);
}

export default async function BalanceSheetDetailsPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const rawQuery = (await searchParams) ?? {};
  const kind = rawQuery.kind === "material" ? "material" : rawQuery.kind === "credit" ? "credit" : "cash";
  const showAmountColumn = kind === "material";
  const category = rawQuery.category ? String(rawQuery.category) : "1";
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const type = rawQuery.type ? String(rawQuery.type).trim() : "";
  const limit = Math.max(1, toNumber(rawQuery.limit, 50));
  const offset = Math.max(0, toNumber(rawQuery.offset, 0));

  const [dateFilterData, detailsData, totalsData, materialTotalsData, creditTotalsData] = await Promise.all([
    fetchIncomeDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    fetchBalanceDetails(tenantId, {
      kind,
      category,
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    fetchBalanceTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).catch(() => ({ lines: [] })),
    fetchBalanceMaterialTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).catch(() => ({ categories: [] })),
    fetchBalanceCreditTotals(tenantId, {
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }).catch(() => ({ categories: [] }))
  ]);

  const allRows = Array.isArray(detailsData) ? detailsData : [];
  const filteredRows = type ? allRows.filter((row) => normalizeType(row) === type) : allRows;
  const rows = filteredRows.slice(offset, offset + limit);
  const hasPrev = offset > 0;
  const hasNext = filteredRows.length > offset + limit;

  const totalsRows = Array.isArray(totalsData?.lines) ? totalsData.lines : [];
  const materialRows = Array.isArray(materialTotalsData?.categories) ? materialTotalsData.categories : [];
  const creditRows = Array.isArray(creditTotalsData?.categories) ? creditTotalsData.categories : [];
  const sourceRows = kind === "material" ? materialRows : kind === "credit" ? creditRows : totalsRows;
  const categoryName = String(
    sourceRows.find((row) => String(row.code ?? "") === String(category))?.label ??
      allRows[0]?.DEFINITION_ ??
      allRows[0]?.NAME ??
      `Category ${category}`
  ).trim();

  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];

  const backQuery = buildQuery({ year, month, startDate, endDate });
  const prevQuery = buildQuery({
    kind,
    category,
    year,
    month,
    startDate,
    endDate,
    type,
    limit,
    offset: Math.max(0, offset - limit)
  });
  const nextQuery = buildQuery({
    kind,
    category,
    year,
    month,
    startDate,
    endDate,
    type,
    limit,
    offset: offset + limit
  });

  const typeSummaryMap = new Map();
  allRows.forEach((row) => {
    const key = normalizeType(row) || "(No Type)";
    const current = typeSummaryMap.get(key) ?? { tmt: 0, usd: 0, count: 0 };
    current.tmt += detailTmtValue(row, kind);
    current.usd += detailUsdValue(row, kind);
    current.count += 1;
    typeSummaryMap.set(key, current);
  });
  const typeSummary = Array.from(typeSummaryMap.entries())
    .map(([name, value]) => ({ name, tmt: value.tmt, usd: value.usd, count: value.count }))
    .sort((a, b) => b.tmt - a.tmt);

  return (
    <div className="layout-grid income-layout-grid income-details-layout income-details-expanded">
      <div>
        <div className="panel">
          <div className="panel-title income-detail-title">
            <Link href={`/${tenantId}/balance-sheet${backQuery ? `?${backQuery}` : ""}`} className="income-detail-back">
              Back to totals
            </Link>
            <div className="income-detail-name">{categoryName}</div>
          </div>
          <div className="income-specode-wrap">
            <table className="income-specode-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Rows</th>
                  <th>TMT</th>
                  <th>USD</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`income-specode-total-row ${!type ? "active" : ""}`.trim()}>
                  <td>
                    <Link
                      href={`/${tenantId}/balance-sheet/details?${buildQuery({
                        kind,
                        category,
                        year,
                        month,
                        startDate,
                        endDate,
                        limit,
                        offset: 0
                      })}`}
                    >
                      Totals
                    </Link>
                  </td>
                  <td>{allRows.length}</td>
                  <td>{money(allRows.reduce((acc, row) => acc + detailTmtValue(row, kind), 0))}</td>
                  <td>{money(allRows.reduce((acc, row) => acc + detailUsdValue(row, kind), 0))}</td>
                </tr>
                {typeSummary.map((item) => (
                  <tr key={item.name} className={type === item.name ? "active" : ""}>
                    <td>
                      <Link
                        href={`/${tenantId}/balance-sheet/details?${buildQuery({
                          kind,
                          category,
                          year,
                          month,
                          startDate,
                          endDate,
                          type: item.name === "(No Type)" ? "" : item.name,
                          limit,
                          offset: 0
                        })}`}
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.count}</td>
                    <td>{money(item.tmt)}</td>
                    <td>{money(item.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <table className="income-details-table">
            <thead>
              <tr>
                <th className="income-details-date-col" style={{ textAlign: "center" }}>Date</th>
                <th style={{ textAlign: "center" }}>{kind === "material" ? "Item" : "Type"}</th>
                <th style={{ textAlign: "center" }}>{kind === "credit" ? "Whouse" : "Client"}</th>
                {showAmountColumn ? <th style={{ textAlign: "center" }}>Amount</th> : null}
                <th style={{ textAlign: "center" }}>Line Exp</th>
                <th className="income-details-money-col">TMT</th>
                <th className="income-details-money-col">USD</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={showAmountColumn ? 7 : 6} style={{ textAlign: "center", color: "#64748b" }}>
                    No details
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={`row-${idx}`}>
                    <td className="income-details-date-col" style={{ textAlign: "center" }}>{isoDate(row.DATE_ ?? row.date_)}</td>
                    <td style={{ textAlign: "center" }}>
                      {String(row.ITEMNAME ?? row.itemname ?? row.TYPE_ ?? row.type_ ?? "-")}
                    </td>
                    <td style={{ textAlign: "center" }}>{String(row.CLIENT ?? row.client ?? row.WHOUSE ?? row.whouse ?? "-")}</td>
                    {showAmountColumn ? (
                      <td style={{ textAlign: "center" }}>{String(row.AMOUNT ?? row.amount ?? "-")}</td>
                    ) : null}
                    <td style={{ textAlign: "center" }}>{String(row.LINEEXP ?? row.lineexp ?? "-")}</td>
                    <td className="income-details-money-col">{money(detailTmtValue(row, kind))}</td>
                    <td className="income-details-money-col">{money(detailUsdValue(row, kind))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Link
            href={hasPrev ? `/${tenantId}/balance-sheet/details?${prevQuery}` : "#"}
            aria-disabled={!hasPrev}
            style={{
              pointerEvents: hasPrev ? "auto" : "none",
              opacity: hasPrev ? 1 : 0.45,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700
            }}
          >
            Prev
          </Link>
          <Link
            href={hasNext ? `/${tenantId}/balance-sheet/details?${nextQuery}` : "#"}
            aria-disabled={!hasNext}
            style={{
              pointerEvents: hasNext ? "auto" : "none",
              opacity: hasNext ? 1 : 0.45,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700
            }}
          >
            Next
          </Link>
        </div>
      </div>

      <IncomeFiltersCard
        title="Filters"
        compact
        showClient={false}
        month={month}
        year={year}
        startDate={startDate}
        endDate={endDate}
        clients={[]}
        months={months}
        years={years}
        category={category}
        limit={limit}
        extraParams={{ kind, type }}
      />
    </div>
  );
}
