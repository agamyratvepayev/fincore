"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TenantReportNav({ tenantId, reports }) {
  const pathname = usePathname();
  const reportItems = Array.isArray(reports) ? reports : [];
  const todoHref = `/${tenantId}/todos`;
  const todoActive = pathname === todoHref || pathname.startsWith(`${todoHref}/`);

  return (
    <div className="reports-shell">
      <div className="reports-nav-row">
        <nav className="reports-nav">
          {reportItems.map((report) => {
            const href = `/${tenantId}/${report.slug}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={report.id} href={href} className={`module-tab${active ? " active" : ""}`}>
                {report.label}
              </Link>
            );
          })}
        </nav>
        <nav className="reports-nav-right">
          <Link href={todoHref} className={`module-tab${todoActive ? " active" : ""}`}>
            toDos
          </Link>
        </nav>
      </div>
    </div>
  );
}
