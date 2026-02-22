import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenant } from "../../../../lib/platform/tenant/resolve-tenant";
import {
  fetchIncomeClients,
  fetchIncomeDetails,
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

function normalizeSpecode(row) {
  return String(row?.SPECODE ?? row?.specode ?? "").trim();
}

function normalizeType(row) {
  return String(row?.TYPE_ ?? row?.type_ ?? row?.TYPE ?? row?.type ?? "").trim();
}

function normalizeBalanceGroup(row) {
  return String(row?.GROUP_ ?? row?.group_ ?? row?.GROUP ?? row?.group ?? "").trim();
}

function text(value) {
  return String(value ?? "").trim();
}

export default async function IncomeStatementDetailsPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const rawQuery = (await searchParams) ?? {};
  const defaultClientCode = "120.05.001";
  const kind = rawQuery.kind === "expense" ? "expense" : rawQuery.kind === "balance" ? "balance" : "revenue";
  const category = rawQuery.category ? String(rawQuery.category) : "1";
  const code = rawQuery.code ? String(rawQuery.code) : defaultClientCode;
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const selectedGroup =
    kind === "expense"
      ? rawQuery.type
        ? String(rawQuery.type).trim()
        : ""
      : kind === "balance"
        ? rawQuery.type
          ? String(rawQuery.type).trim()
          : ""
      : rawQuery.specode
        ? String(rawQuery.specode).trim()
        : "";
  const limit = Math.max(1, toNumber(rawQuery.limit, 50));
  const offset = Math.max(0, toNumber(rawQuery.offset, 0));

  const [dateFilterData, clientsData, detailsData] = await Promise.all([
    fetchIncomeDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    fetchIncomeClients(tenantId).catch(() => []),
    fetchIncomeDetails(tenantId, kind, {
      category,
      code: code || undefined,
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })
  ]);

  const allRows = Array.isArray(detailsData?.rows) ? detailsData.rows : [];
  const categoryName = String(
    allRows[0]?.CATEGORY ??
      allRows[0]?.NAME ??
      allRows[0]?.ADDR1 ??
      allRows[0]?.name ??
      (category === "1" ? "Edilen is F2" : category === "2" ? "Konwertasiya" : category === "3" ? "Beylekiler" : `Category ${category}`)
  ).trim();
  const groupLabel = kind === "expense" ? "Type" : kind === "balance" ? "Type" : "Specode";
  const normalizeGroup = kind === "expense" ? normalizeType : kind === "balance" ? normalizeBalanceGroup : normalizeSpecode;
  const groupFilteredRows = selectedGroup
    ? allRows.filter((row) => normalizeGroup(row) === selectedGroup)
    : allRows;
  const rows = groupFilteredRows.slice(offset, offset + limit);
  const hasPrev = offset > 0;
  const hasNext = groupFilteredRows.length > offset + limit;
  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const clients = Array.isArray(clientsData) ? clientsData : [];
  const backQuery = buildQuery({ code, year, month, startDate, endDate });
  const prevQuery = buildQuery({
    kind,
    category,
    code,
    year,
    month,
    startDate,
    endDate,
    [kind === "expense" || kind === "balance" ? "type" : "specode"]: selectedGroup,
    limit,
    offset: Math.max(0, offset - limit)
  });
  const nextQuery = buildQuery({
    kind,
    category,
    code,
    year,
    month,
    startDate,
    endDate,
    [kind === "expense" || kind === "balance" ? "type" : "specode"]: selectedGroup,
    limit,
    offset: offset + limit
  });

  const groupSummaryMap = new Map();
  allRows.forEach((row) => {
    const key = normalizeGroup(row) || `(No ${groupLabel})`;
    const current = groupSummaryMap.get(key) ?? { tmt: 0, usd: 0, count: 0 };
    current.tmt += Number(row.LINENET ?? row.linenet ?? 0);
    current.usd += Number(row.REPORTNET ?? row.reportnet ?? 0);
    current.count += 1;
    groupSummaryMap.set(key, current);
  });
  const groupSummary = Array.from(groupSummaryMap.entries())
    .map(([name, value]) => ({ name, tmt: value.tmt, usd: value.usd, count: value.count }))
    .sort((a, b) => b.tmt - a.tmt);
  const showNameAmountColumns = allRows.some((row) => text(row.ADDR1 ?? row.addr1) && text(row.AMOUNT ?? row.amount));

  return (
    <div className="layout-grid income-layout-grid income-details-layout income-details-expanded">
      <div>
        <div className="panel">
          <div className="panel-title income-detail-title">
            <Link href={`/${tenantId}/income-statement${backQuery ? `?${backQuery}` : ""}`} className="income-detail-back">
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
                <tr className={`income-specode-total-row ${!selectedGroup ? "active" : ""}`.trim()}>
                  <td>
                    <Link
                      href={`/${tenantId}/income-statement/details?${buildQuery({
                        kind,
                        category,
                        code,
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
                  <td>{money(allRows.reduce((acc, row) => acc + Number(row.LINENET ?? row.linenet ?? 0), 0))}</td>
                  <td>{money(allRows.reduce((acc, row) => acc + Number(row.REPORTNET ?? row.reportnet ?? 0), 0))}</td>
                </tr>
                {groupSummary.map((item) => (
                  <tr key={item.name} className={selectedGroup === item.name ? "active" : ""}>
                    <td>
                      <Link
                        href={`/${tenantId}/income-statement/details?${buildQuery({
                          kind,
                          category,
                          code,
                          year,
                          month,
                          startDate,
                          endDate,
                          [kind === "expense" || kind === "balance" ? "type" : "specode"]:
                            item.name === `(No ${groupLabel})` ? "" : item.name,
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
                <th style={{ textAlign: "center" }}>{groupLabel}</th>
                {showNameAmountColumns ? <th style={{ textAlign: "center" }}>ITEMNAME</th> : null}
                {showNameAmountColumns ? <th style={{ textAlign: "center" }}>Amount</th> : null}
                <th style={{ textAlign: "center" }}>Line Exp</th>
                <th className="income-details-money-col">TMT</th>
                <th className="income-details-money-col">USD</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={showNameAmountColumns ? 7 : 5} style={{ textAlign: "center", color: "#64748b" }}>
                    No details
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const amountText = text(row.AMOUNT ?? row.amount);
                  const nameText = amountText
                    ? String(row.ITEMNAME ?? row.itemname ?? "")
                    : "";
                  const groupValue = normalizeGroup(row) || "-";
                  return (
                    <tr key={`row-${idx}`}>
                      <td className="income-details-date-col" style={{ textAlign: "center" }}>
                        {isoDate(row.DATE_ ?? row.date_ ?? row.date)}
                      </td>
                      <td style={{ textAlign: "center" }}>{groupValue}</td>
                      {showNameAmountColumns ? <td style={{ textAlign: "center" }}>{nameText}</td> : null}
                      {showNameAmountColumns ? <td style={{ textAlign: "center" }}>{amountText}</td> : null}
                      <td style={{ textAlign: "center" }}>{String(row.LINEEXP ?? row.lineexp ?? "-")}</td>
                      <td className="income-details-money-col">{money(row.LINENET ?? row.linenet)}</td>
                      <td className="income-details-money-col">{money(row.REPORTNET ?? row.reportnet)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Link
            href={hasPrev ? `/${tenantId}/income-statement/details?${prevQuery}` : "#"}
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
            href={hasNext ? `/${tenantId}/income-statement/details?${nextQuery}` : "#"}
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
        code={code}
        month={month}
        year={year}
        startDate={startDate}
        endDate={endDate}
        clients={clients}
        months={months}
        years={years}
        category={category}
        limit={limit}
        extraParams={{
          kind,
          [kind === "expense" || kind === "balance" ? "type" : "specode"]: selectedGroup
        }}
      />
    </div>
  );
}
