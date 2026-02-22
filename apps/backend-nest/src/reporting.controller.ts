import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query
} from "@nestjs/common";
import type { ReportQuery } from "./shared/reporting/reporting.types.js";
import { getTenantReportingProvider } from "./platform/reporting/registry/tenant-reporting.registry.js";
import { resolveTenantOrNull } from "./platform/tenant/tenant.resolver.js";

@Controller()
export class ReportingController {
  private assertSupportedTenant(tenantId: string) {
    const tenant = resolveTenantOrNull(tenantId);
    if (!tenant) throw new NotFoundException(`Tenant '${tenantId}' not found.`);
    const provider = getTenantReportingProvider(tenantId);
    if (!provider) {
      throw new BadRequestException(`Tenant '${tenantId}' is not enabled for reporting in this build.`);
    }
    return provider;
  }

  private parseOptionalNumber(value: unknown) {
    if (value == null) return undefined;
    const text = String(value).trim();
    if (!text) return undefined;
    const num = Number(text);
    return Number.isFinite(num) ? num : undefined;
  }

  private parseOptionalText(value: unknown) {
    if (value == null) return undefined;
    const text = String(value).trim();
    return text ? text : undefined;
  }

  private queryCode(query: ReportQuery) {
    return this.parseOptionalText((query as Record<string, unknown>).code);
  }

  @Get("/tenants/:tenantId/reports/income-statement/date-filters")
  async dateFilters(@Param("tenantId") tenantId: string) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.dateFilters(tenantId);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/client-names")
  async clientNames(@Param("tenantId") tenantId: string) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.clients(tenantId);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement")
  async incomeStatement(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.execute(tenantId, query.from, query.to);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/revenue-totals")
  async incomeRevenueTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.revenueTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: this.parseOptionalNumber(query.year),
        month: this.parseOptionalNumber(query.month),
        startDate: this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/expense-totals")
  async incomeExpenseTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.expenseTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: this.parseOptionalNumber(query.year),
        month: this.parseOptionalNumber(query.month),
        startDate: this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/details")
  async incomeDetails(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const kind = query.kind === "expense" ? "expense" : "revenue";
      return await provider.income.details(
        tenantId,
        kind,
        query.from,
        query.to,
        this.parseOptionalText(query.client) ?? this.queryCode(query),
        this.parseOptionalNumber(query.year),
        this.parseOptionalNumber(query.month),
        this.parseOptionalText(query.startDate ?? query.startdate),
        this.parseOptionalText(query.endDate ?? query.enddate),
        query.category,
        this.parseOptionalNumber(query.offset),
        this.parseOptionalNumber(query.limit)
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet")
  async balanceTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.execute(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/details")
  async balanceDetails(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.details(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        category: this.parseOptionalText(query.category),
        offset: this.parseOptionalNumber(query.offset),
        limit: this.parseOptionalNumber(query.limit),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
