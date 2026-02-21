import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { decodeSession, defaultTenantIdForSession, sessionCookieName } from "../../../lib/auth/session";
import { readUsers } from "../../../lib/auth/users";
import { TENANTS } from "../../../lib/tenants";
import UserFormCard from "./user-form-card";

function viewRole(role) {
  if (role === "admin") return "admin";
  if (role === "manager") return "manager";
  return "viewer";
}

function allTenantsRole(role) {
  return role === "admin" || role === "manager";
}

export default async function UsersPage({ searchParams }) {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(sessionCookieName())?.value);
  if (!session) redirect("/login");
  if (session.role !== "admin") {
    const fallbackTenant = defaultTenantIdForSession(session);
    redirect(`/${fallbackTenant}`);
  }

  const sp = await searchParams;
  const users = readUsers();
  const editUsername = String(sp?.edit ?? "");
  const selectedUser = users.find((u) => u.username === editUsername) ?? null;
  const isEditMode = Boolean(selectedUser);
  const ok = String(sp?.ok ?? "");
  const rawError = String(sp?.error ?? "");
  let error = rawError;
  try {
    error = decodeURIComponent(rawError);
  } catch {
    error = rawError;
  }

  return (
    <main className="users-wrap">
      <div className="users-head">
        <Link href="/gurlusyk">Back to Dashboard</Link>
        <strong>{session.username}</strong>
      </div>

      {ok ? <div className="users-banner users-banner-ok">Success: {ok}</div> : null}
      {error ? <div className="users-banner users-banner-error">Error: {error}</div> : null}

      <div className="users-grid">
        <section className="users-card users-card-main">
          <h2>Users</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Tenants</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{viewRole(u.role)}</td>
                  <td>{allTenantsRole(u.role) ? "ALL" : u.tenantIds.join(", ")}</td>
                  <td>{u.note}</td>
                  <td className="users-actions">
                    <Link className="btn-modify" href={`/admin/users?edit=${encodeURIComponent(u.username)}`}>
                      Modify
                    </Link>
                    <form method="post" action="/admin/users/delete">
                      <input type="hidden" name="username" value={u.username} />
                      <button type="submit" className="btn-remove">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="users-side">
          {isEditMode ? (
            <>
              <div className="users-mode-head">
                <span className="users-mode-badge">Modify Mode</span>
                <Link href="/admin/users" className="users-mode-link">
                  Switch to Add User
                </Link>
              </div>
              <UserFormCard mode="update" user={selectedUser} tenants={TENANTS} />
            </>
          ) : (
            <>
              <div className="users-mode-head">
                <span className="users-mode-badge">Create Mode</span>
              </div>
              <UserFormCard mode="create" tenants={TENANTS} />
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
