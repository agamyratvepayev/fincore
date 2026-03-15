const TENANT_REPORTS = {
  gurlusyk: [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    },
    {
      id: "balance-sheet",
      slug: "balance-sheet",
      label: "Balans Hasabaty",
      description: "Balance Sheet"
    }
  ],
  agro: [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    },
    {
      id: "balance-sheet",
      slug: "balance-sheet",
      label: "Balans Hasabaty",
      description: "Balance Sheet"
    }
  ],
  "algy-bergi": [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    },
    {
      id: "balance-sheet",
      slug: "balance-sheet",
      label: "Balans Hasabaty",
      description: "Balance Sheet"
    },
    {
      id: "cashflow",
      slug: "cashflow",
      label: "Pul Hasabaty",
      description: "Cashflow"
    }
  ],
  "maksat-deri": [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    },
    {
      id: "balance-sheet",
      slug: "balance-sheet",
      label: "Balans Hasabaty",
      description: "Balance Sheet"
    },
    {
      id: "cashflow",
      slug: "cashflow",
      label: "Pul Hasabaty",
      description: "Cashflow"
    }
  ],
  yupluk: [
    {
      id: "income-statement",
      slug: "income-statement",
      label: "Peyda Hasabaty",
      description: "Income Statement"
    },
    {
      id: "balance-sheet",
      slug: "balance-sheet",
      label: "Balans Hasabaty",
      description: "Balance Sheet"
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
