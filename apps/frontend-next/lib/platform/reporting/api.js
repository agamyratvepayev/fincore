function backendBaseUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4100";
}

async function responseErrorMessage(response) {
  try {
    const data = await response.json();
    const message = String(data?.message ?? "").trim();
    return message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
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
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load revenue totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchIncomeExpenseTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/expense-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load expense totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchIncomeBalanceTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/income-statement/balance-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance totals (${response.status}): ${message}`);
  }
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
  if (!retryResponse.ok) {
    const message = await responseErrorMessage(retryResponse);
    throw new Error(`Failed to load ${kindValue} details (${retryResponse.status}): ${message}`);
  }
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
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceDateFilters(tenantId) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/date-filters`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance date filters (${response.status}): ${message}`);
  }
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
  if (!retryResponse.ok) {
    const message = await responseErrorMessage(retryResponse);
    throw new Error(`Failed to load balance details (${retryResponse.status}): ${message}`);
  }
  return retryResponse.json();
}

export async function fetchBalanceMaterialTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/material-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance material totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceCreditTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/credit-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance credit totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceDebitTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/debit-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance debit totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceBioTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/bio-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance bio totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceLoanTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/loan-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance loan totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceAdvanceTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/advance-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance advance totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceIntangibleTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/intangible-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance intangible totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchBalanceShareTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/balance-sheet/share-totals`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load balance share totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchCashflowTotals(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/cashflow`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load cashflow totals (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchCashflowDetails(tenantId, filters = {}) {
  const url = withQuery(`/tenants/${tenantId}/reports/cashflow/details`, filters);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load cashflow details (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchCashflowDateFilters(tenantId) {
  const url = withQuery(`/tenants/${tenantId}/reports/cashflow/date-filters`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load cashflow date filters (${response.status}): ${message}`);
  }
  return response.json();
}

export async function fetchCashflowAccounts(tenantId) {
  const url = withQuery(`/tenants/${tenantId}/reports/cashflow/accounts`);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await responseErrorMessage(response);
    throw new Error(`Failed to load cashflow accounts (${response.status}): ${message}`);
  }
  return response.json();
}
