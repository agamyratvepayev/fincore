function backendBaseUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4100";
}

function withQuery(path, query = {}) {
  const url = new URL(path, backendBaseUrl());
  Object.entries(query).forEach(([key, value]) => {
    if (value == null) return;
    const text = String(value).trim();
    if (!text) return;
    url.searchParams.set(key, text);
  });
  return url.toString();
}

export async function fetchIncomeRevenueTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/revenue-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load revenue totals (${response.status})`);
  return response.json();
}

export async function fetchIncomeExpenseTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/expense-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load expense totals (${response.status})`);
  return response.json();
}

export async function fetchIncomeBalanceTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/balance-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load balance totals (${response.status})`);
  return response.json();
}

export async function fetchIncomeDetails(tenantId, kind, filters = {}) {
  const kindValue = kind === "expense" ? "expense" : kind === "balance" ? "balance" : "revenue";
  const requestFilters = { ...filters, kind: kindValue };
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/details`, requestFilters);
  const response = await fetch(url, { cache: "no-store" });
  if (response.ok) return response.json();

  // Some SQL versions behind this endpoint reject OFFSET=0 in the proc.
  // Retry once without pagination params so details page still loads.
  const retryFilters = { ...requestFilters };
  delete retryFilters.offset;
  delete retryFilters.limit;
  const retryUrl = withQuery(`/tenants/${tenantId}/reports/income-statement/details`, retryFilters);
  const retryResponse = await fetch(retryUrl, { cache: "no-store" });
  if (!retryResponse.ok) throw new Error(`Failed to load ${kindValue} details (${retryResponse.status})`);
  return retryResponse.json();
}

export async function fetchIncomeRevenueDetails(tenantId, filters = {}) {
  return fetchIncomeDetails(tenantId, "revenue", filters);
}

export async function fetchIncomeExpenseDetails(tenantId, filters = {}) {
  return fetchIncomeDetails(tenantId, "expense", filters);
}

export async function fetchIncomeBalanceDetails(tenantId, filters = {}) {
  return fetchIncomeDetails(tenantId, "balance", filters);
}

export async function fetchIncomeDateFilters(tenantId) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/date-filters`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load date filters (${response.status})`);
  return response.json();
}

export async function fetchIncomeClients(tenantId) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/client-names`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load clients (${response.status})`);
  return response.json();
}

export async function fetchBalanceTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load balance totals (${response.status})`);
  return response.json();
}

export async function fetchBalanceDetails(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/details`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (response.ok) return response.json();

  const retryFilters = { ...filters };
  delete retryFilters.offset;
  delete retryFilters.limit;
  const retryUrl = withQuery(`/tenants/${tenantId}/reports/balance-sheet/details`, retryFilters);
  const retryResponse = await fetch(retryUrl, { cache: "no-store" });
  if (!retryResponse.ok) throw new Error(`Failed to load balance details (${retryResponse.status})`);
  return retryResponse.json();
}

export async function fetchBalanceMaterialTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/material-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load balance material totals (${response.status})`);
  return response.json();
}
