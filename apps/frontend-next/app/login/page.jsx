export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const hasError = String(sp?.error ?? "") === "1";
  return (
    <main className="login-wrap">
      <section className="login-card">
        <h1>Login</h1>
        {hasError ? <p className="login-error">Invalid username or password.</p> : null}
        <form method="post" action="/auth/login" className="login-form">
          <label>
            Username
            <input name="username" type="text" required autoFocus />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit">Sign In</button>
        </form>
      </section>
    </main>
  );
}
