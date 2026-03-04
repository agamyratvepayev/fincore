# FinCore

Multi-tenant reporting + automation starter for 20+ tenants.

## Stack
- Backend API: NestJS (`apps/backend-nest`)
- Frontend app: Next.js (`apps/frontend-next`, package name `@fincore/frontend-next`)
- App database: PostgreSQL
- Reporting source database: Microsoft SQL Server

## Starter Tree
```text
fincore/
  apps/
    backend-nest/
      src/modules/
        gurlusyk/
          reporting/
            income-statement/
            balance-sheet/
    frontend-next/  # Next.js frontend (package: @fincore/frontend-next)
  packages/
    tenant-core/
    db-postgres/
    db-mssql/
    reporting-core/
    automation-core/
```

## Tenant Strategy (start simple, upgrade safely)
1. Keep all tenant metadata in `packages/tenant-core`.
2. Use PostgreSQL for config/jobs/audit tables.
3. Use MSSQL read-only queries for reporting sources.
4. Route every request with `tenantId` from header/path/subdomain.
5. Add queue workers (BullMQ) later for scheduled reports.

## Suggested Upgrade Path
1. Add auth + RBAC in API layer.
2. Add job queue + scheduler (`automation-core`) and retry policy.
3. Add template versioning for reports.
4. Add observability (OpenTelemetry + Prometheus + structured logs).
5. Add per-tenant rate limits and circuit breakers for MSSQL.

## Quick Start
```bash
pnpm install
pnpm dev
```

Run PostgreSQL and MSSQL natively (no Docker), then configure `.env` with:
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`
- `MSSQL_SERVER`, `MSSQL_PORT`, `MSSQL_USER`, `MSSQL_PASSWORD`, `MSSQL_DATABASE`, `MSSQL_ENCRYPT`

## MSSQL Env (supported)
- Current keys: `MSSQL_SERVER`, `MSSQL_PORT`, `MSSQL_USER`, `MSSQL_PASSWORD`, `MSSQL_DATABASE`, `MSSQL_ENCRYPT`
- Sequelize-style aliases also supported: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_ENCRYPT`, `DB_TRUST_SERVER_CERT`

## Reporting Endpoints (enabled tenant: gurlusyk)
- `GET /tenants/gurlusyk/reports/income-statement/revenue-totals`
- `GET /tenants/gurlusyk/reports/income-statement/details?kind=revenue&category=ALL&offset=0&limit=50`
- `GET /tenants/gurlusyk/reports/balance-sheet`
- `GET /tenants/gurlusyk/reports/balance-sheet/details?category=0&offset=0&limit=50`

## Automation Endpoint
- `POST /tenants/gurlusyk/automation/report-jobs`

Example body:
```json
{
  "reportCode": "income-statement",
  "runAt": "2026-02-18T10:00:00.000Z"
}
```

## Frontend
- Main UI: `http://localhost:3000` (Next.js)
- Tenant example: `http://localhost:3000/gurlusyk/reporting/income-statement/totals`

## Income Query Layer
- `apps/backend-nest/src/modules/gurlusyk/reporting/income-statement/income-statement.queries.ts`
- Queries are executed with named placeholders (`:client`, `:year`, etc.) via:
  - `packages/db-mssql/src/query.ts`

## Backend API
- NestJS API base: `http://localhost:4100`
