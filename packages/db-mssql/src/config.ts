import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type MssqlEnvConfig = {
  server: string;
  user: string;
  password: string;
  database: string;
  port: number;
  dialect: "mssql";
  dialectOptions: {
    options: {
      encrypt: boolean;
      trustServerCertificate: boolean;
    };
  };
};

let loadedEnv = false;

function loadEnvIfNeeded() {
  if (loadedEnv) return;
  loadedEnv = true;

  if (process.env.MSSQL_USER != null || process.env.DB_USER != null) return;

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(currentDir, "../../../.env")
  ];

  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] != null) continue;
      const rawValue = trimmed.slice(eq + 1).trim();
      const unquoted =
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
          ? rawValue.slice(1, -1)
          : rawValue;
      process.env[key] = unquoted;
    }
    return;
  }
}

function toBool(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  return value === "true" || value === "1";
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (value == null) continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export function getMssqlEnvConfig(): MssqlEnvConfig {
  loadEnvIfNeeded();

  return {
    server: firstNonEmpty(process.env.DB_HOST, process.env.MSSQL_SERVER, "localhost"),
    user: firstNonEmpty(process.env.DB_USER, process.env.MSSQL_USER),
    password: firstNonEmpty(process.env.DB_PASSWORD, process.env.MSSQL_PASSWORD),
    database: firstNonEmpty(process.env.DB_NAME, process.env.MSSQL_DATABASE),
    port: Number(firstNonEmpty(process.env.DB_PORT, process.env.MSSQL_PORT, "1433")),
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: toBool(process.env.DB_ENCRYPT ?? process.env.MSSQL_ENCRYPT, false),
        trustServerCertificate: toBool(
          process.env.DB_TRUST_SERVER_CERT ?? process.env.MSSQL_TRUST_SERVER_CERT,
          true
        )
      }
    }
  };
}
