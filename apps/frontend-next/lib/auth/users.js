import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { TENANTS } from "../tenants";

const usersPath = path.resolve(process.cwd(), "apps/frontend-next/.data/users.json");
const ALL_TENANT_IDS = TENANTS.map((t) => t.id);

function normalizeRole(value) {
  const role = String(value ?? "").trim().toLowerCase();
  if (role === "admin" || role === "manager" || role === "viewer") return role;
  // Backward compatibility for old persisted value.
  if (role === "user") return "viewer";
  return "viewer";
}

function normalizeTenantIds(value) {
  if (value === "*" || value === "ALL") return ALL_TENANT_IDS;
  if (Array.isArray(value)) return Array.from(new Set(value.map((x) => String(x).trim()).filter(Boolean)));
  return [];
}

function ensureStore() {
  const dir = path.dirname(usersPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (!existsSync(usersPath)) {
    const defaultUser = {
      username: process.env.FRONTEND_USER ?? "admin",
      password: process.env.FRONTEND_PASSWORD ?? "admin123",
      role: "admin",
      tenantIds: ALL_TENANT_IDS,
      note: "Default admin"
    };
    writeFileSync(usersPath, JSON.stringify([defaultUser], null, 2), "utf8");
  }
}

export function readUsers() {
  ensureStore();
  try {
    const content = readFileSync(usersPath, "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((u) => ({
        username: String(u.username ?? "").trim(),
        password: String(u.password ?? ""),
        role: normalizeRole(u.role),
        tenantIds: normalizeTenantIds(u.tenantIds),
        note: String(u.note ?? "")
      }))
      .filter((u) => u.username);
  } catch {
    return [];
  }
}

export function writeUsers(users) {
  ensureStore();
  writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
}

export function findUser(username) {
  const name = String(username ?? "").trim();
  if (!name) return null;
  return readUsers().find((u) => u.username === name) ?? null;
}

export function upsertUser(input) {
  const users = readUsers();
  const username = String(input.username ?? "").trim();
  if (!username) throw new Error("username is required");
  const role = normalizeRole(input.role);
  const note = String(input.note ?? "");
  const tenantIds = normalizeTenantIds(input.tenantIds);
  const existing = users.find((u) => u.username === username);
  const isAllTenantRole = role === "admin" || role === "manager";

  if (role === "viewer" && tenantIds.length === 0) {
    throw new Error("viewer must have at least one tenant");
  }

  if (existing) {
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (existing.role === "admin" && role !== "admin" && adminCount <= 1) {
      throw new Error("cannot demote the last admin");
    }

    existing.role = role;
    existing.note = note;
    existing.tenantIds = isAllTenantRole ? ALL_TENANT_IDS : tenantIds;
    if (input.password && String(input.password).trim()) {
      const newPassword = String(input.password);
      if (newPassword.length < 8) throw new Error("password must be at least 8 characters");
      existing.password = newPassword;
    }
  } else {
    const password = String(input.password ?? "").trim();
    if (!password) throw new Error("password is required");
    if (password.length < 8) throw new Error("password must be at least 8 characters");
    users.push({
      username,
      password,
      role,
      tenantIds: isAllTenantRole ? ALL_TENANT_IDS : tenantIds,
      note
    });
  }

  writeUsers(users);
}

export function updateUser(originalUsername, input) {
  const users = readUsers();
  const original = String(originalUsername ?? "").trim();
  const username = String(input.username ?? "").trim();
  if (!original) throw new Error("original username is required");
  if (!username) throw new Error("username is required");

  const existing = users.find((u) => u.username === original);
  if (!existing) throw new Error("user not found");

  const duplicate = users.find((u) => u.username === username && u.username !== original);
  if (duplicate) throw new Error("username already exists");

  const role = normalizeRole(input.role);
  const note = String(input.note ?? "");
  const tenantIds = normalizeTenantIds(input.tenantIds);
  const isAllTenantRole = role === "admin" || role === "manager";

  if (role === "viewer" && tenantIds.length === 0) {
    throw new Error("viewer must have at least one tenant");
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  if (existing.role === "admin" && role !== "admin" && adminCount <= 1) {
    throw new Error("cannot demote the last admin");
  }

  existing.username = username;
  existing.role = role;
  existing.note = note;
  existing.tenantIds = isAllTenantRole ? ALL_TENANT_IDS : tenantIds;

  if (input.password && String(input.password).trim()) {
    const newPassword = String(input.password);
    if (newPassword.length < 8) throw new Error("password must be at least 8 characters");
    existing.password = newPassword;
  }

  writeUsers(users);
}

export function deleteUser(username) {
  const name = String(username ?? "").trim();
  if (!name) return;
  const users = readUsers().filter((u) => u.username !== name);
  writeUsers(users);
}
