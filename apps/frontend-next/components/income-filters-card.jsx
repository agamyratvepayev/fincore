"use client";

import { usePathname, useRouter } from "next/navigation";

function toText(value) {
  return value == null ? "" : String(value);
}

export default function IncomeFiltersCard({
  title = "Filters",
  code = "",
  month = "",
  year = "",
  startDate = "",
  endDate = "",
  clients = [],
  months = [],
  years = [],
  category,
  limit,
  compact = false,
  extraParams = {},
  showClient = true
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateWith = (nextValues) => {
    const qs = new URLSearchParams();

    Object.entries(extraParams || {}).forEach(([key, value]) => {
      const text = toText(value).trim();
      if (text) qs.set(key, text);
    });

    if (showClient && nextValues.code) qs.set("code", nextValues.code);
    if (nextValues.month) qs.set("month", nextValues.month);
    if (nextValues.year) qs.set("year", nextValues.year);
    if (nextValues.startDate) qs.set("startDate", nextValues.startDate);
    if (nextValues.endDate) qs.set("endDate", nextValues.endDate);

    if (category != null) {
      qs.set("category", String(category));
      qs.set("offset", "0");
      if (limit != null) qs.set("limit", String(limit));
    }

    const query = qs.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  const onChange = (key) => (event) => {
    navigateWith({
      code,
      month,
      year,
      startDate,
      endDate,
      [key]: toText(event.target.value)
    });
  };

  const onClear = (key) => (event) => {
    event.preventDefault();
    navigateWith({
      code,
      month,
      year,
      startDate,
      endDate,
      [key]: ""
    });
  };

  return (
    <div className={`filter-card income-filter-card${compact ? " income-filter-card-compact" : ""}`}>
      <div className="filter-head income-filter-head">{title}</div>
      <div className="filter-body">
        {showClient ? (
          <>
            <label className="filter-label">Client</label>
            <select value={code} onChange={onChange("code")} className="filter-control income-select-compact">
              {clients.map((client, idx) => {
                const clientCode = String(client.code ?? "").trim();
                const clientName = String(client.name ?? clientCode).trim();
                if (!clientCode) return null;
                return (
                  <option key={`${clientCode}-${idx}`} value={clientCode}>
                    {clientName}
                  </option>
                );
              })}
            </select>
          </>
        ) : null}

        <div className="filter-grid-two">
          <div>
            <label className="filter-label">
              <span>Month</span>
              <a href="#" onClick={onClear("month")}>
                Clear
              </a>
            </label>
            <select value={month} onChange={onChange("month")} className="filter-control income-select-compact">
              <option value="">All</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="filter-label">
              <span>Year</span>
              <a href="#" onClick={onClear("year")}>
                Clear
              </a>
            </label>
            <select value={year} onChange={onChange("year")} className="filter-control income-select-compact">
              <option value="">All</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-grid-two">
          <div>
            <label className="filter-label">
              <span>Start Date</span>
            </label>
            <div className="date-input-wrap">
              <input type="date" value={startDate} onChange={onChange("startDate")} className="date-control date-control-with-clear" />
              <a className="date-clear-link" href="#" onClick={onClear("startDate")}>
                x
              </a>
            </div>
          </div>
          <div>
            <label className="filter-label">
              <span>End Date</span>
            </label>
            <div className="date-input-wrap">
              <input type="date" value={endDate} onChange={onChange("endDate")} className="date-control date-control-with-clear" />
              <a className="date-clear-link" href="#" onClick={onClear("endDate")}>
                x
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
