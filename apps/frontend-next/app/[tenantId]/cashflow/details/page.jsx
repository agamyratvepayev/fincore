import Link from "next/link";
import { notFound } from "next/navigation";
import IncomeFiltersCard from "../../../../components/income-filters-card";
import { resolveTenant } from "../../../../lib/platform/tenant/resolve-tenant";
import {
  fetchCashflowAccounts,
  fetchCashflowDateFilters,
  fetchCashflowDetails
} from "../../../../lib/platform/reporting/api";

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

function isoDate(value) {
  if (!value) return "-";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString().slice(0, 10);
}

export default async function CashflowDetailsPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant || (tenant.id !== "maksat-deri" && tenant.id !== "algy-bergi")) notFound();
  const isMaksatDeri = tenant.id === "maksat-deri";

  const rawQuery = (await searchParams) ?? {};
  const code = rawQuery.code ? String(rawQuery.code) : "";
  const clcode = rawQuery.clcode ? String(rawQuery.clcode) : "";
  const year = rawQuery.year ? String(rawQuery.year) : "";
  const month = rawQuery.month ? String(rawQuery.month) : "";
  const startDate = rawQuery.startDate ? String(rawQuery.startDate) : "";
  const endDate = rawQuery.endDate ? String(rawQuery.endDate) : "";
  const limit = Math.max(1, toNumber(rawQuery.limit, 50));
  const offset = Math.max(0, toNumber(rawQuery.offset, 0));

  if (!code || !clcode) notFound();

  const [dateFilterData, cashAccounts, detailsData] = await Promise.all([
    fetchCashflowDateFilters(tenantId).catch(() => ({ years: [], months: [] })),
    fetchCashflowAccounts(tenantId).catch(() => []),
    fetchCashflowDetails(tenantId, {
      code,
      clcode,
      year: year || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      offset,
      limit
    }).catch(() => ({ rows: [], paging: { offset, limit } }))
  ]);

  const rows = Array.isArray(detailsData?.rows) ? detailsData.rows : [];
  const hasPrev = offset > 0;
  const hasNext = rows.length >= limit;
  const years = Array.isArray(dateFilterData?.years) ? dateFilterData.years : [];
  const months = Array.isArray(dateFilterData?.months) ? dateFilterData.months : [];
  const clients = (Array.isArray(cashAccounts) ? cashAccounts : [])
    .map((row) => ({
      code: String(row.code ?? "").trim(),
      name: String(row.name ?? row.code ?? "").trim()
    }))
    .filter((row) => row.code)
    .filter((row) => (isMaksatDeri ? !row.name.toUpperCase().includes("BANK") : true));

  const selectedCash = clients.find((row) => row.code === code);
  const title = String(rows[0]?.CLIENT ?? rows[0]?.client ?? clcode).trim() || clcode;
  const backQuery = buildQuery({ code, year, month, startDate, endDate });
  const prevQuery = buildQuery({
    code,
    clcode,
    year,
    month,
    startDate,
    endDate,
    limit,
    offset: Math.max(0, offset - limit)
  });
  const nextQuery = buildQuery({
    code,
    clcode,
    year,
    month,
    startDate,
    endDate,
    limit,
    offset: offset + limit
  });

  return (
    <div className="layout-grid income-layout-grid income-details-layout income-details-expanded">
      <div>
        <div className="panel">
          <div className="panel-title income-detail-title">
            <Link href={`/${tenantId}/cashflow${backQuery ? `?${backQuery}` : ""}`} className="income-detail-back">
              Back to totals
            </Link>
            <div className="income-detail-name">{title}</div>
          </div>
          <table className="income-details-table">
            <thead>
              <tr>
                <th className="income-details-date-col" style={{ textAlign: "center" }}>Date</th>
                <th style={{ textAlign: "center" }}>Type</th>
                <th style={{ textAlign: "center" }}>Group</th>
                <th style={{ textAlign: "center" }}>Line Exp</th>
                <th className="income-details-money-col">Income</th>
                <th className="income-details-money-col">Outcome</th>
                <th className="income-details-money-col">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#64748b" }}>
                    No details
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const income = Number(row.INCOME ?? row.income ?? 0);
                  const outcome = Number(row.OUTCOME ?? row.outcome ?? 0);
                  return (
                    <tr key={`row-${idx}`}>
                      <td className="income-details-date-col" style={{ textAlign: "center" }}>
                        {isoDate(row.DATE_ ?? row.date_)}
                      </td>
                      <td style={{ textAlign: "center" }}>{String(row.TYPE_ ?? row.type_ ?? "-")}</td>
                      <td style={{ textAlign: "center" }}>{String(row.GROUP_ ?? row.group_ ?? "-")}</td>
                      <td style={{ textAlign: "center" }}>{String(row.LINEEXP ?? row.lineexp ?? "-")}</td>
                      <td className="income-details-money-col">{money(income)}</td>
                      <td className="income-details-money-col">{money(outcome)}</td>
                      <td className="income-details-money-col">{money(income + outcome)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Link
            href={hasPrev ? `/${tenantId}/cashflow/details?${prevQuery}` : "#"}
            aria-disabled={!hasPrev}
            style={{ pointerEvents: hasPrev ? "auto" : "none", opacity: hasPrev ? 1 : 0.45, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontWeight: 700 }}
          >
            Prev
          </Link>
          <Link
            href={hasNext ? `/${tenantId}/cashflow/details?${nextQuery}` : "#"}
            aria-disabled={!hasNext}
            style={{ pointerEvents: hasNext ? "auto" : "none", opacity: hasNext ? 1 : 0.45, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontWeight: 700 }}
          >
            Next
          </Link>
        </div>
      </div>

      <IncomeFiltersCard
        title="Cashflow Filters"
        compact
        code={code}
        clients={clients}
        months={months}
        years={years}
        month={month}
        year={year}
        startDate={startDate}
        endDate={endDate}
        showClient
        extraParams={{ clcode, limit }}
      />
    </div>
  );
}
