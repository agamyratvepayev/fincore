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

        return await service.revenueTotals(tenantId, {
          from: query.from,
          to: query.to,
          client: parseOptionalText(query.client ?? query.code),
          year: parseOptionalNumber(query.year),
          month: parseOptionalNumber(query.month),
          startDate: parseOptionalText(query.startDate ?? query.startdate),
          endDate: parseOptionalText(query.endDate ?? query.enddate)
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement/expense-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };

        return await service.expenseTotals(tenantId, {
          from: query.from,
          to: query.to,
          client: parseOptionalText(query.client ?? query.code),
          year: parseOptionalNumber(query.year),
          month: parseOptionalNumber(query.month),
          startDate: parseOptionalText(query.startDate ?? query.startdate),
          endDate: parseOptionalText(query.endDate ?? query.enddate)
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/income-statement/balance-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };

        return await service.balanceTotals(tenantId, {
          from: query.from,
          to: query.to,
          client: parseOptionalText(query.client ?? query.code),
          year: parseOptionalNumber(query.year),
          month: parseOptionalNumber(query.month),
          startDate: parseOptionalText(query.startDate ?? query.startdate),
          endDate: parseOptionalText(query.endDate ?? query.enddate)
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
        const kind = query.kind === "expense" ? "expense" : query.kind === "balance" ? "balance" : "revenue";
        return await service.details(
          tenantId,
          kind,
          query.from,
          query.to,
          parseOptionalText(query.client ?? query.code),
          parseOptionalNumber(query.year),
          parseOptionalNumber(query.month),
          parseOptionalText(query.startDate ?? query.startdate),
          parseOptionalText(query.endDate ?? query.enddate),
          query.category,
          parseOptionalNumber(query.offset),
          parseOptionalNumber(query.limit)
        );
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
}
