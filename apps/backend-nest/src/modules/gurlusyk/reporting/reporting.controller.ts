import type { FastifyInstance } from "fastify";
import { balanceSheetController } from "./balance-sheet/balance-sheet.controller.js";
import { BalanceSheetService } from "./balance-sheet/balance-sheet.service.js";
import { incomeStatementController } from "./income-statement/income-statement.controller.js";
import { IncomeStatementService } from "./income-statement/income-statement.service.js";

export async function reportingController(server: FastifyInstance) {
  const incomeStatementService = new IncomeStatementService();
  const balanceSheetService = new BalanceSheetService();

  await incomeStatementController(server, incomeStatementService);
  await balanceSheetController(server, balanceSheetService);
}

