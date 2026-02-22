import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { TENANTS } from "../../lib/tenants";
import { resolveTenant } from "../../lib/platform/tenant/resolve-tenant";
import { decodeSession, hasTenantAccess, sessionCookieName } from "../../lib/auth/session";
import { getTenantReports } from "../../lib/platform/reporting/reports";
import TenantReportNav from "../../components/tenant-report-nav";

export default async function TenantLayout({ children, params }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);
  const visibleTenants = TENANTS.filter((t) => hasTenantAccess(session, t.id));
  const reports = getTenantReports(tenantId);

  return (
    <>
      <header className="top">
        <div className="head">
          <Link className="brand" href="/">
            <span className="brand-badge">F</span>
            <span>FinCore</span>
          </Link>
          <div className="tenant-wrap">
            <nav className="tenant-nav">
              {visibleTenants.map((item) => (
                <Link key={item.id} href={`/${item.id}`} className={`tenant-chip${item.id === tenantId ? " active" : ""}`}>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="head-actions">
            <div className="head-userbox">
              <span className="head-user">{session?.username ?? "-"}</span>
              {session?.role === "admin" ? (
                <Link className="head-link" href="/admin/users">
                  Users
                </Link>
              ) : null}
              <Link className="head-link head-link-logout" href="/logout">
                Logout
              </Link>
            </div>
          </div>
        </div>
        <TenantReportNav tenantId={tenantId} reports={reports} />
      </header>
      <main className="wrap">
        <section className="card">{children}</section>
      </main>
    </>
  );
}
