import type { FastifyInstance } from "fastify";
import { incomeStatementController } from "./income-statement/income-statement.controller.js";
import { IncomeStatementService } from "./income-statement/income-statement.service.js";

export async function reportingController(server: FastifyInstance) {
  const incomeStatementService = new IncomeStatementService();
  await incomeStatementController(server, incomeStatementService);
}
