import { QueryTypes } from "sequelize";
import { getMssqlSequelize } from "./client.js";

export type MssqlParams = Record<string, string | number | boolean | null | undefined>;

export async function executeNamedQuery<T extends Record<string, unknown>>(
  template: string,
  params: MssqlParams = {}
): Promise<T[]> {
  const sequelize = await getMssqlSequelize();
  const replacements = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, value ?? null])
  );
  const rows = await sequelize.query(template, {
    replacements,
    type: QueryTypes.SELECT
  });
  return rows as T[];
}
