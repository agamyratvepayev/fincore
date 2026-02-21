"use client";

import { useMemo, useState } from "react";

function normalizeRole(value) {
  const role = String(value ?? "").trim().toLowerCase();
  if (role === "admin" || role === "manager" || role === "viewer") return role;
  return "viewer";
}

export default function UserFormCard({ mode, user, tenants }) {
  const initialRole = normalizeRole(user?.role ?? "viewer");
  const [role, setRole] = useState(initialRole);
  const [localError, setLocalError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const showTenants = role === "viewer";

  const selectedIds = useMemo(() => {
    if (!user || !Array.isArray(user.tenantIds)) return [];
    return user.tenantIds;
  }, [user]);
  const [selectedTenantIds, setSelectedTenantIds] = useState(mode === "update" ? selectedIds : []);
  const isViewerWithoutTenant = role === "viewer" && selectedTenantIds.length === 0;

  return (
    <section className="users-card users-card-strong">
      <h2>{mode === "update" ? "Modify User" : "Add User"}</h2>
      <form
        method="post"
        action={mode === "update" ? "/admin/users/update" : "/admin/users/create"}
        className="users-form"
        onSubmit={(e) => {
          setSubmitAttempted(true);
          const form = e.currentTarget;
          const formData = new FormData(form);
          const selectedRole = normalizeRole(formData.get("role"));
          if (selectedRole !== "viewer") {
            setLocalError("");
            return;
          }
          const tenantIds = formData.getAll("tenantIds").map((v) => String(v).trim()).filter(Boolean);
          if (tenantIds.length === 0) {
            e.preventDefault();
            setLocalError("Viewer must have at least one tenant.");
            return;
          }
          setLocalError("");
        }}
      >
        <label>Username</label>
        {mode === "update" ? (
          <>
            <input name="username" defaultValue={user?.username ?? ""} required />
            <input type="hidden" name="originalUsername" value={user?.username ?? ""} />
          </>
        ) : (
          <input name="username" placeholder="Username" required />
        )}

        <label>{mode === "update" ? "New Password (optional)" : "Password"}</label>
        <input
          name="password"
          type="password"
          placeholder={mode === "update" ? "Leave empty to keep current" : "At least 8 characters"}
          minLength={8}
          required={mode === "create"}
        />

        <label>Note</label>
        <textarea name="note" placeholder="Optional note about this user" defaultValue={user?.note ?? ""} rows={3} />

        <label>Role</label>
        <select
          name="role"
          value={role}
          onChange={(e) => {
            const nextRole = normalizeRole(e.target.value);
            setRole(nextRole);
            if (nextRole !== "viewer") {
              setLocalError("");
            }
          }}
        >
          <option value="viewer">viewer</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>

        {showTenants ? (
          <>
            <label>Tenant Access</label>
            <div className="tenants-grid">
              {tenants.map((t, idx) => {
                const inputId = `${mode}-tenant-${t.id}-${idx}`;
                return (
                <label key={`${mode}-${t.id}`} className="tenant-option" htmlFor={inputId}>
                  <input
                    id={inputId}
                    type="checkbox"
                    name="tenantIds"
                    value={t.id}
                    checked={selectedTenantIds.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenantIds((prev) => (prev.includes(t.id) ? prev : [...prev, t.id]));
                        return;
                      }
                      setSelectedTenantIds((prev) => prev.filter((id) => id !== t.id));
                    }}
                  />
                  <span>{t.name}</span>
                </label>
              )})}
            </div>
          </>
        ) : null}

        {submitAttempted && isViewerWithoutTenant ? <p className="users-form-error">Select at least one tenant for viewer role.</p> : null}
        <button type="submit" disabled={isViewerWithoutTenant}>
          {mode === "update" ? "Update User" : "Create User"}
        </button>
        {role === "viewer" && localError ? <p className="users-form-error">{localError}</p> : null}
      </form>
    </section>
  );
}
