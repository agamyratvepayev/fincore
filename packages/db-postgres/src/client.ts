import { Pool } from "pg";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let loadedEnv = false;

function loadEnvIfNeeded() {
  if (loadedEnv) return;
  loadedEnv = true;

  if (process.env.PG_PASSWORD != null && process.env.PG_HOST != null) return;

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

function envString(value: unknown) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function toBool(value: unknown, fallback: boolean) {
  if (value == null) return fallback;
  const text = String(value).trim().toLowerCase();
  if (!text) return fallback;
  return text === "1" || text === "true" || text === "yes" || text === "on";
}

loadEnvIfNeeded();

const useSsl = toBool(process.env.PG_SSL, false);
const rejectUnauthorized = toBool(process.env.PG_SSL_REJECT_UNAUTHORIZED, false);

export const pgPool = new Pool({
  host: envString(process.env.PG_HOST) || "localhost",
  port: Number(envString(process.env.PG_PORT) || 5432),
  user: envString(process.env.PG_USER),
  password: envString(process.env.PG_PASSWORD),
  database: envString(process.env.PG_DATABASE),
  ssl: useSsl
    ? {
        rejectUnauthorized
      }
    : undefined
});
