import { notFound, redirect } from "next/navigation";
import { resolveTenant } from "../../lib/platform/tenant/resolve-tenant";
import { getTenantReports } from "../../lib/platform/reporting/reports";

export default async function TenantPage({ params }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();
  const reports = getTenantReports(tenantId);
  const defaultReport = reports[0];

  if (defaultReport) {
    redirect(`/${tenantId}/${defaultReport.slug}`);
  }

  return <p style={{ marginBottom: 0, color: "#475569" }}>No reports configured yet for this tenant.</p>;
}
