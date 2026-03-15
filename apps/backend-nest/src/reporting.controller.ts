import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Query
} from "@nestjs/common";
import type { ReportQuery } from "./shared/reporting/reporting.types.js";
import { getTenantReportingProvider } from "./platform/reporting/registry/tenant-reporting.registry.js";
import { resolveTenantOrNull } from "./platform/tenant/tenant.resolver.js";

@Controller()
export class ReportingController {
  private errorMessage(error: unknown): string {
    if (error instanceof AggregateError) {
      const nested = Array.from(error.errors ?? [])
        .map((item) => (item instanceof Error ? item.message : String(item)))
        .filter(Boolean);
      if (nested.length > 0) return `AggregateError: ${nested.join("; ")}`;
      return error.message || "AggregateError";
    }
    if (error instanceof Error && error.message) return error.message;
    return String(error ?? "Unknown error");
  }

  private rethrowBadRequest(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new BadRequestException(this.errorMessage(error));
  }

  private assertSupportedTenant(tenantId: string) {
    const tenant = resolveTenantOrNull(tenantId);
    if (!tenant) throw new NotFoundException(`Tenant '${tenantId}' not found.`);
    const provider = getTenantReportingProvider(tenantId);
    if (!provider) {
      throw new BadRequestException(`Tenant '${tenantId}' is not enabled for reporting in this build.`);
    }
    return provider;
  }

  private assertCashflowTenant(tenantId: string) {
    const provider = this.assertSupportedTenant(tenantId);
    if (!provider.cashflow) {
      throw new BadRequestException(`Tenant '${tenantId}' does not support cashflow reporting in this build.`);
    }
    return provider.cashflow;
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
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/client-names")
  async clientNames(@Param("tenantId") tenantId: string) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.clients(tenantId);
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement")
  async incomeStatement(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.execute(tenantId, query.from, query.to);
    } catch (error) {
      this.rethrowBadRequest(error);
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
      this.rethrowBadRequest(error);
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
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/balance-totals")
  async incomeBalanceTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      return await provider.income.balanceTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: this.parseOptionalNumber(query.year),
        month: this.parseOptionalNumber(query.month),
        startDate: this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/income-statement/details")
  async incomeDetails(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const kind = query.kind === "expense" ? "expense" : query.kind === "balance" ? "balance" : "revenue";
      return await provider.income.details(
        tenantId,
        kind,
        query.from,
        query.to,
        this.parseOptionalText((query as Record<string, unknown>).clcode) ??
          this.parseOptionalText(query.client) ??
          this.queryCode(query),
        this.parseOptionalNumber(query.year),
        this.parseOptionalNumber(query.month),
        this.parseOptionalText(query.startDate ?? query.startdate),
        this.parseOptionalText(query.endDate ?? query.enddate),
        query.category,
        this.parseOptionalNumber(query.offset),
        this.parseOptionalNumber(query.limit)
      );
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/cashflow")
  async cashflowTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const cashflow = this.assertCashflowTenant(tenantId);
    try {
      return await cashflow.totals(tenantId, {
        from: query.from,
        to: query.to,
        code: this.parseOptionalText(query.code) ?? this.parseOptionalText(query.client),
        year: this.parseOptionalNumber(query.year),
        month: this.parseOptionalNumber(query.month),
        startDate: this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/cashflow/details")
  async cashflowDetails(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const cashflow = this.assertCashflowTenant(tenantId);
    try {
      return await cashflow.details(tenantId, {
        from: query.from,
        to: query.to,
        code: this.parseOptionalText(query.code) ?? this.parseOptionalText(query.client),
        clcode: this.parseOptionalText((query as Record<string, unknown>).clcode),
        year: this.parseOptionalNumber(query.year),
        month: this.parseOptionalNumber(query.month),
        startDate: this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: this.parseOptionalText(query.endDate ?? query.enddate),
        offset: this.parseOptionalNumber(query.offset),
        limit: this.parseOptionalNumber(query.limit)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/cashflow/date-filters")
  async cashflowDateFilters(@Param("tenantId") tenantId: string) {
    const cashflow = this.assertCashflowTenant(tenantId);
    try {
      return await cashflow.dateFilters(tenantId);
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/cashflow/accounts")
  async cashflowAccounts(@Param("tenantId") tenantId: string) {
    const cashflow = this.assertCashflowTenant(tenantId);
    try {
      return await cashflow.accounts(tenantId);
    } catch (error) {
      this.rethrowBadRequest(error);
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
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/date-filters")
  async balanceDateFilters(@Param("tenantId") tenantId: string) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const balanceWithDates = provider.balance as { dateFilters?: (tenantId: string) => Promise<unknown> };
      if (typeof balanceWithDates.dateFilters !== "function") {
        throw new BadRequestException(`Tenant '${tenantId}' does not support balance date filters in this build.`);
      }
      return await balanceWithDates.dateFilters(tenantId);
    } catch (error) {
      this.rethrowBadRequest(error);
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
        kind:
          this.parseOptionalText((query as Record<string, unknown>).kind) === "material"
            ? "material"
            : this.parseOptionalText((query as Record<string, unknown>).kind) === "credit"
              ? "credit"
              : this.parseOptionalText((query as Record<string, unknown>).kind) === "debit"
                ? "debit"
              : this.parseOptionalText((query as Record<string, unknown>).kind) === "bio"
                ? "bio"
                : this.parseOptionalText((query as Record<string, unknown>).kind) === "loan"
                  ? "loan"
                  : this.parseOptionalText((query as Record<string, unknown>).kind) === "advance"
                    ? "advance"
                    : this.parseOptionalText((query as Record<string, unknown>).kind) === "intangible"
                      ? "intangible"
                      : this.parseOptionalText((query as Record<string, unknown>).kind) === "share"
                        ? "share"
              : "cash",
        category: this.parseOptionalText(query.category) ?? this.queryCode(query),
        code: this.queryCode(query),
        offset: this.parseOptionalNumber(query.offset),
        limit: this.parseOptionalNumber(query.limit),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/material-totals")
  async balanceMaterialTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.materialTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/credit-totals")
  async balanceCreditTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.creditTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/debit-totals")
  async balanceDebitTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.debitTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/bio-totals")
  async balanceBioTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.bioTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/loan-totals")
  async balanceLoanTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.loanTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/advance-totals")
  async balanceAdvanceTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.advanceTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/intangible-totals")
  async balanceIntangibleTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.intangibleTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }

  @Get("/tenants/:tenantId/reports/balance-sheet/share-totals")
  async balanceShareTotals(@Param("tenantId") tenantId: string, @Query() query: ReportQuery) {
    const provider = this.assertSupportedTenant(tenantId);
    try {
      const parsedYear = this.parseOptionalNumber(query.year);
      const parsedMonth = this.parseOptionalNumber(query.month);
      const shouldIgnoreDates = parsedYear != null || parsedMonth != null;
      return await provider.balance.shareTotals(tenantId, {
        from: query.from,
        to: query.to,
        client: this.parseOptionalText(query.client) ?? this.queryCode(query),
        year: parsedYear,
        month: parsedMonth,
        startDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.startDate ?? query.startdate),
        endDate: shouldIgnoreDates ? undefined : this.parseOptionalText(query.endDate ?? query.enddate)
      });
    } catch (error) {
      this.rethrowBadRequest(error);
    }
  }
}
