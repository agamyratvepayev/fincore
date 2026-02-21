import type { FastifyInstance } from "fastify";
import type { ReportQuery } from "../../../../shared/reporting/reporting.types.js";
import { tenantMiddleware } from "../reporting.middleware.js";
import { IncomeStatementService } from "./income-statement.service.js";

export async function incomeStatementController(
  server: FastifyInstance,
  service = new IncomeStatementService()
) {
  const parseOptionalNumber = (value: unknown) => {
    if (value == null) return undefined;
    const text = String(value).trim();
    if (!text) return undefined;
    const num = Number(text);
    return Number.isFinite(num) ? num : undefined;
  };
  const parseOptionalText = (value: unknown) => {
    if (value == null) return undefined;
    const text = String(value).trim();
    return text ? text : undefined;
  };

  server.get(
    "/tenants/:tenantId/reports/income-statement/date-filters",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        return await service.dateFilters(tenantId);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement/client-names",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        return await service.clients(tenantId);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const { from, to } = request.query as ReportQuery;
        return await service.execute(tenantId, from, to);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement/revenue-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;

        return await service.revenueTotals(tenantId, {
          from: query.from,
          to: query.to,
          client: parseOptionalText(query.client ?? query.code),
          year: parsedYear,
          month: parsedMonth,
          startDate: shouldIgnoreDates ? undefined : parseOptionalText(query.startDate ?? query.startdate),
          endDate: shouldIgnoreDates ? undefined : parseOptionalText(query.endDate ?? query.enddate)
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement/details",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const kind = query.kind ?? "revenue";
        if (kind !== "revenue" && kind !== "expense") {
          return reply.status(400).send({ message: "kind must be 'revenue' or 'expense'" });
        }

        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;

        return await service.details(
          tenantId,
          kind,
          query.from,
          query.to,
          parseOptionalText(query.client ?? query.code),
          parsedYear,
          parsedMonth,
          shouldIgnoreDates ? undefined : parseOptionalText(query.startDate ?? query.startdate),
          shouldIgnoreDates ? undefined : parseOptionalText(query.endDate ?? query.enddate),
          query.category,
          Number(query.offset ?? 0),
          Number(query.limit ?? 50)
        );
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
}
