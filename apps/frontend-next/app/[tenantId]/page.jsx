import { notFound } from "next/navigation";
import { resolveTenant } from "../../lib/platform/tenant/resolve-tenant";

export default async function TenantPage({ params }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Reports Are Being Rebuilt</h1>
      <p style={{ marginBottom: 0, color: "#475569" }}>
        Tenant: <strong>{tenant.name}</strong>. Login, logout, tenant navigation, and user management are active.
      </p>
    </div>
  );
}
