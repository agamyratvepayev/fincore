export type TenantConfig = {
  id: string;
  name: string;
  pgSchema: string;
  mssqlDatabase: string;
  features: {
    reporting: boolean;
    automation: boolean;
  };
};

const tenants: TenantConfig[] = [
  {
    id: "agro",
    name: "Agro",
    pgSchema: "agro",
    mssqlDatabase: "ReportingAgro",
    features: { reporting: true, automation: true }
  },
  {
    id: "gurlusyk",
    name: "Gurlusyk",
    pgSchema: "gurlusyk",
    mssqlDatabase: "ReportingGurlusyk",
    features: { reporting: true, automation: true }
  },
  {
    id: "tenant-a",
    name: "Tenant A",
    pgSchema: "tenant_a",
    mssqlDatabase: "ReportingA",
    features: { reporting: false, automation: false }
  },
  {
    id: "tenant-b",
    name: "Tenant B",
    pgSchema: "tenant_b",
    mssqlDatabase: "ReportingB",
    features: { reporting: false, automation: false }
  },
  {
    id: "maksat-deri",
    name: "Maksat Deri",
    pgSchema: "maksat_deri",
    mssqlDatabase: "ReportingMaksatDeri",
    features: { reporting: true, automation: false }
  },
  {
    id: "yupluk",
    name: "Yupluk",
    pgSchema: "yupluk",
    mssqlDatabase: "UNRN",
    features: { reporting: true, automation: false }
  }
];

export function getTenantById(id: string): TenantConfig | undefined {
  return tenants.find((tenant) => tenant.id === id);
}

export function listTenants(): TenantConfig[] {
  return tenants;
}

export function tenantHasFeature(
  tenantId: string,
  feature: keyof TenantConfig["features"]
): boolean {
  const tenant = getTenantById(tenantId);
  if (!tenant) return false;
  return tenant.features[feature];
}
