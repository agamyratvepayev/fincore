import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { TENANTS } from "../tenants";

function appRootDir() {
  const cwd = process.cwd();
  if (cwd.endsWith(path.join("apps", "frontend-next"))) return cwd;
  return path.resolve(cwd, "apps/frontend-next");
}

const todosPath = path.resolve(appRootDir(), ".data/todos.json");
const ALLOWED_STATES = new Set(["Pending", "Started", "Completed", "Problem", "Overdue"]);
const KNOWN_TENANTS = new Set(TENANTS.map((t) => t.id));

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normalizeState(value) {
  const text = normalizeText(value);
  if (ALLOWED_STATES.has(text)) return text;
  return "Pending";
}

function normalizeTenantId(value) {
  const tenantId = normalizeText(value).toLowerCase();
  return KNOWN_TENANTS.has(tenantId) ? tenantId : "";
}

function normalizeTodo(todo) {
  const tenantId = normalizeTenantId(todo?.tenantId);
  if (!tenantId) return null;

  const id = normalizeText(todo?.id);
  const jobName = normalizeText(todo?.jobName);
  if (!id || !jobName) return null;

  return {
    id,
    tenantId,
    jobName,
    jobDescription: normalizeText(todo?.jobDescription),
    deadline: normalizeDate(todo?.deadline),
    note: normalizeText(todo?.note),
    createdDate: normalizeDate(todo?.createdDate) || new Date().toISOString().slice(0, 10),
    state: normalizeState(todo?.state)
  };
}

function ensureStore() {
  const dir = path.dirname(todosPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(todosPath)) writeFileSync(todosPath, "[]", "utf8");
}

function writeTodos(todos) {
  ensureStore();
  writeFileSync(todosPath, JSON.stringify(todos, null, 2), "utf8");
}

export function readTodos() {
  ensureStore();
  try {
    const content = readFileSync(todosPath, "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTodo).filter(Boolean);
  } catch {
    return [];
  }
}

export function listTodosByTenant(tenantId) {
  const key = normalizeTenantId(tenantId);
  if (!key) return [];
  return readTodos()
    .filter((item) => item.tenantId === key)
    .sort((a, b) => {
      const aDeadline = a.deadline || "9999-12-31";
      const bDeadline = b.deadline || "9999-12-31";
      return aDeadline.localeCompare(bDeadline);
    });
}

export function createTodo(input) {
  const tenantId = normalizeTenantId(input?.tenantId);
  if (!tenantId) throw new Error("invalid tenant");

  const jobName = normalizeText(input?.jobName);
  if (!jobName) throw new Error("job name is required");

  const todo = normalizeTodo({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tenantId,
    jobName,
    jobDescription: input?.jobDescription,
    deadline: input?.deadline,
    note: input?.note,
    createdDate: new Date().toISOString().slice(0, 10),
    state: input?.state
  });
  if (!todo) throw new Error("invalid todo");

  const todos = readTodos();
  todos.push(todo);
  writeTodos(todos);
  return todo;
}

export function updateTodo(input) {
  const id = normalizeText(input?.id);
  if (!id) throw new Error("todo id is required");

  const todos = readTodos();
  const target = todos.find((item) => item.id === id);
  if (!target) throw new Error("todo not found");

  const nextJobName = normalizeText(input?.jobName);
  if (!nextJobName) throw new Error("job name is required");

  target.jobName = nextJobName;
  target.jobDescription = normalizeText(input?.jobDescription);
  target.deadline = normalizeDate(input?.deadline);
  target.note = normalizeText(input?.note);
  target.state = normalizeState(input?.state);

  writeTodos(todos);
  return target;
}

export function deleteTodo(id) {
  const todoId = normalizeText(id);
  if (!todoId) return;
  const todos = readTodos().filter((item) => item.id !== todoId);
  writeTodos(todos);
}

export function findTodo(id) {
  const todoId = normalizeText(id);
  if (!todoId) return null;
  return readTodos().find((item) => item.id === todoId) ?? null;
}

export function todoStates() {
  return Array.from(ALLOWED_STATES);
}
