const TENANT_REPORTS = {
  gurlusyk: [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    }
  ]
};

export function getTenantReports(tenantId) {
  const key = String(tenantId || "").toLowerCase();
  return TENANT_REPORTS[key] ?? [];
}

export function getTenantReport(tenantId, reportSlug) {
  const slug = String(reportSlug || "").toLowerCase();
  return getTenantReports(tenantId).find((item) => item.slug === slug) ?? null;
}
