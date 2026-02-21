import { BalanceSheetService } from "../../../modules/gurlusyk/reporting/balance-sheet/balance-sheet.service.js";
import { IncomeStatementService } from "../../../modules/gurlusyk/reporting/income-statement/income-statement.service.js";
import type { TenantReportingProvider } from "../contracts/report.interface.js";

const providers = new Map<string, TenantReportingProvider>([
  [
    "gurlusyk",
    {
      tenantId: "gurlusyk",
      income: new IncomeStatementService(),
      balance: new BalanceSheetService()
    }
  ]
]);

export function getTenantReportingProvider(tenantId: string): TenantReportingProvider | null {
  return providers.get(tenantId.toLowerCase()) ?? null;
}
