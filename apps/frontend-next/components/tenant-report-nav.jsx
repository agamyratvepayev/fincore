"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TenantReportNav({ tenantId, reports }) {
  const pathname = usePathname();
  if (!Array.isArray(reports) || reports.length === 0) return null;

  return (
    <div className="reports-shell">
      <nav className="reports-nav">
        {reports.map((report) => {
          const href = `/${tenantId}/${report.slug}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={report.id} href={href} className={`module-tab${active ? " active" : ""}`}>
              {report.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
