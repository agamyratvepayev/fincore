import type { FastifyInstance } from "fastify";
import type { ReportQuery } from "../../../../shared/reporting/reporting.types.js";
import { tenantMiddleware } from "../reporting.middleware.js";
import { BalanceSheetService } from "./balance-sheet.service.js";

export async function balanceSheetController(
  server: FastifyInstance,
  service = new BalanceSheetService()
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
    "/tenants/:tenantId/reports/balance-sheet",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.execute(tenantId, {
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
    "/tenants/:tenantId/reports/balance-sheet/details",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.details(tenantId, {
          from: query.from,
          to: query.to,
          client: parseOptionalText(query.client ?? query.code),
          kind:
            parseOptionalText((query as Record<string, unknown>).kind) === "material"
              ? "material"
              : parseOptionalText((query as Record<string, unknown>).kind) === "credit"
                ? "credit"
                : parseOptionalText((query as Record<string, unknown>).kind) === "debit"
                  ? "debit"
                  : parseOptionalText((query as Record<string, unknown>).kind) === "bio"
                    ? "bio"
                    : parseOptionalText((query as Record<string, unknown>).kind) === "loan"
                      ? "loan"
                      : parseOptionalText((query as Record<string, unknown>).kind) === "advance"
                        ? "advance"
                        : parseOptionalText((query as Record<string, unknown>).kind) === "intangible"
                          ? "intangible"
                          : parseOptionalText((query as Record<string, unknown>).kind) === "share"
                            ? "share"
                            : "cash",
          category: parseOptionalText(query.category ?? query.code),
          offset: parseOptionalNumber(query.offset),
          limit: parseOptionalNumber(query.limit),
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
    "/tenants/:tenantId/reports/balance-sheet/material-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.materialTotals(tenantId, {
          from: query.from,
          to: query.to,
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
    "/tenants/:tenantId/reports/balance-sheet/credit-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.creditTotals(tenantId, {
          from: query.from,
          to: query.to,
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
    "/tenants/:tenantId/reports/balance-sheet/debit-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.debitTotals(tenantId, {
          from: query.from,
          to: query.to,
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
    "/tenants/:tenantId/reports/balance-sheet/bio-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        return await service.bioTotals(tenantId, {
          from: query.from,
          to: query.to
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/balance-sheet/loan-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        return await service.loanTotals(tenantId, {
          from: query.from,
          to: query.to
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/balance-sheet/advance-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        const parsedYear = parseOptionalNumber(query.year);
        const parsedMonth = parseOptionalNumber(query.month);
        const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
        return await service.advanceTotals(tenantId, {
          from: query.from,
          to: query.to,
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
    "/tenants/:tenantId/reports/balance-sheet/intangible-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        return await service.intangibleTotals(tenantId, {
          from: query.from,
          to: query.to
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  server.get(
    "/tenants/:tenantId/reports/balance-sheet/share-totals",
    { preHandler: tenantMiddleware },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const query = request.query as ReportQuery & { code?: string };
        return await service.shareTotals(tenantId, {
          from: query.from,
          to: query.to
        });
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
}
