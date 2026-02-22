import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { resolveTenant } from "../../../lib/platform/tenant/resolve-tenant";
import { decodeSession, hasTenantAccess, sessionCookieName } from "../../../lib/auth/session";
import { createTodo, deleteTodo, findTodo, listTodosByTenant, todoStates, updateTodo } from "../../../lib/todos/store";

function stateClass(state) {
  const key = String(state || "").toLowerCase();
  if (key === "completed") return "todo-state-ok";
  if (key === "problem" || key === "overdue") return "todo-state-bad";
  if (key === "started") return "todo-state-warn";
  return "todo-state-pending";
}

function formatDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toISOString().slice(0, 10);
}

export default async function TenantTodosPage({ params, searchParams }) {
  const { tenantId } = await params;
  const tenant = resolveTenant(tenantId);
  if (!tenant) notFound();

  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);
  if (!hasTenantAccess(session, tenantId)) notFound();

  const role = String(session?.role ?? "viewer").toLowerCase();
  const canCreateDelete = role === "admin";
  const canModify = role === "admin" || role === "manager";
  const todos = listTodosByTenant(tenantId);
  const states = todoStates();
  const sp = (await searchParams) ?? {};
  const ok = String(sp.ok ?? "").trim();
  const error = String(sp.error ?? "").trim();

  async function createTodoAction(formData) {
    "use server";
    const cookieStore = await cookies();
    const currentSession = decodeSession(cookieStore.get(sessionCookieName())?.value);
    if (!currentSession || currentSession.role !== "admin" || !hasTenantAccess(currentSession, tenantId)) {
      return;
    }
    createTodo({
      tenantId,
      jobName: String(formData.get("jobName") ?? ""),
      jobDescription: String(formData.get("jobDescription") ?? ""),
      deadline: String(formData.get("deadline") ?? ""),
      note: String(formData.get("note") ?? ""),
      state: String(formData.get("state") ?? "Pending")
    });
    revalidatePath(`/${tenantId}/todos`);
  }

  async function updateTodoAction(formData) {
    "use server";
    const cookieStore = await cookies();
    const currentSession = decodeSession(cookieStore.get(sessionCookieName())?.value);
    const role = String(currentSession?.role ?? "").toLowerCase();
    const canEdit = role === "admin" || role === "manager";
    if (!currentSession || !canEdit || !hasTenantAccess(currentSession, tenantId)) {
      return;
    }

    const id = String(formData.get("id") ?? "");
    const current = findTodo(id);
    if (!current || current.tenantId !== tenantId) return;

    updateTodo({
      id,
      jobName: String(formData.get("jobName") ?? ""),
      jobDescription: String(formData.get("jobDescription") ?? ""),
      deadline: String(formData.get("deadline") ?? ""),
      note: String(formData.get("note") ?? ""),
      state: String(formData.get("state") ?? "Pending")
    });
    revalidatePath(`/${tenantId}/todos`);
  }

  async function deleteTodoAction(formData) {
    "use server";
    const cookieStore = await cookies();
    const currentSession = decodeSession(cookieStore.get(sessionCookieName())?.value);
    if (!currentSession || currentSession.role !== "admin" || !hasTenantAccess(currentSession, tenantId)) {
      return;
    }

    const id = String(formData.get("id") ?? "");
    const current = findTodo(id);
    if (!current || current.tenantId !== tenantId) return;
    deleteTodo(id);
    revalidatePath(`/${tenantId}/todos`);
  }

  return (
    <div className="todos-wrap">
      <div className="todos-head">
        <div>
          <h2>ToDos</h2>
        </div>
      </div>

      {ok ? <div className="todos-banner todos-banner-ok">Saved: {ok}</div> : null}
      {error ? <div className="todos-banner todos-banner-error">Error: {error}</div> : null}

      {canCreateDelete ? (
        <form action={createTodoAction} className="todos-form">
          <input name="jobName" required placeholder="Job Name" />
          <input name="jobDescription" placeholder="Job Description" />
          <input name="deadline" type="date" className="todos-deadline-input" />
          <input name="note" placeholder="Note" />
          <select name="state" defaultValue="Pending" className="todos-state-input">
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <button type="submit">Add ToDo</button>
        </form>
      ) : null}

      <div className="todos-table-wrap">
        <table className="todos-table">
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Job Description</th>
              <th>Deadline</th>
              <th>Note</th>
              <th>Created Date</th>
              <th>State</th>
              {(canModify || canCreateDelete) ? <th></th> : null}
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr>
                <td colSpan={(canModify || canCreateDelete) ? 7 : 6} className="todos-empty">
                  No toDos
                </td>
              </tr>
            ) : (
              todos.map((todo) => (
                <tr key={todo.id}>
                  {canModify ? (
                    <>
                      <td colSpan={6}>
                        <form action={updateTodoAction} className="todos-row-form">
                          <input type="hidden" name="id" value={todo.id} />
                          <div className="todos-row-grid">
                            <input name="jobName" defaultValue={todo.jobName} required />
                            <input name="jobDescription" defaultValue={todo.jobDescription} />
                            <input name="deadline" type="date" defaultValue={formatDate(todo.deadline)} className="todos-deadline-input" />
                            <input name="note" defaultValue={todo.note} />
                            <span className="todos-created todos-created-input">{formatDate(todo.createdDate)}</span>
                            <select name="state" defaultValue={todo.state} className="todos-state-input">
                              {states.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            <div className="todos-edit-actions">
                              <button type="submit" className="todos-save-btn">Save</button>
                            </div>
                          </div>
                        </form>
                      </td>
                      {canCreateDelete ? (
                        <td>
                          <form action={deleteTodoAction} className="todos-remove-form">
                            <input type="hidden" name="id" value={todo.id} />
                            <button className="todos-delete-btn" type="submit">
                              Remove
                            </button>
                          </form>
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </>
                  ) : (
                    <>
                      <td className="todos-display-cell">{todo.jobName}</td>
                      <td className="todos-display-cell">{todo.jobDescription || "-"}</td>
                      <td className="todos-display-cell">{formatDate(todo.deadline)}</td>
                      <td className="todos-display-cell">{todo.note || "-"}</td>
                      <td className="todos-display-cell">{formatDate(todo.createdDate)}</td>
                      <td className="todos-display-cell">
                        <span className={`todo-state ${stateClass(todo.state)}`}>{todo.state}</span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
