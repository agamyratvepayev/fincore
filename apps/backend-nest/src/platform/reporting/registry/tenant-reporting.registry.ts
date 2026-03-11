import { BalanceSheetService } from "../../../modules/gurlusyk/reporting/balance-sheet/balance-sheet.service.js";
import { BalanceSheetService as AgroBalanceSheetService } from "../../../modules/agro/reporting/balance-sheet/balance-sheet.service.js";
import { IncomeStatementService as AgroIncomeStatementService } from "../../../modules/agro/reporting/income-statement/income-statement.service.js";
import { IncomeStatementService } from "../../../modules/gurlusyk/reporting/income-statement/income-statement.service.js";
import { BalanceSheetService as MaksatDeriBalanceSheetService } from "../../../modules/maksat-deri/reporting/balance-sheet/balance-sheet.service.js";
import { IncomeStatementService as MaksatDeriIncomeStatementService } from "../../../modules/maksat-deri/reporting/income-statement/income-statement.service.js";
import { BalanceSheetService as YuplukBalanceSheetService } from "../../../modules/yupluk/reporting/balance-sheet/balance-sheet.service.js";
import { IncomeStatementService as YuplukIncomeStatementService } from "../../../modules/yupluk/reporting/income-statement/income-statement.service.js";
import type { TenantReportingProvider } from "../contracts/report.interface.js";

const providers = new Map<string, TenantReportingProvider>([
  [
    "gurlusyk",
    {
      tenantId: "gurlusyk",
      income: new IncomeStatementService(),
      balance: new BalanceSheetService()
    }
  ],
  [
    "agro",
    {
      tenantId: "agro",
      income: new AgroIncomeStatementService(),
      balance: new AgroBalanceSheetService()
    }
  ],
  [
    "maksat-deri",
    {
      tenantId: "maksat-deri",
      income: new MaksatDeriIncomeStatementService(),
      balance: new MaksatDeriBalanceSheetService()
    }
  ],
  [
    "yupluk",
    {
      tenantId: "yupluk",
      income: new YuplukIncomeStatementService(),
      balance: new YuplukBalanceSheetService()
    }
  ]
]);

export function getTenantReportingProvider(tenantId: string): TenantReportingProvider | null {
  return providers.get(tenantId.toLowerCase()) ?? null;
}
