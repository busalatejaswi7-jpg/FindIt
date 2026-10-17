"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../lib/apis";
import { saveAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser({
        email: email.trim(),
        password,
      });

      saveAuth(data.token, data.user);
      router.push("/");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="login-heading">
        <p className="section-kicker">Your FINDIT account</p>
        <h1
          id="login-heading"
          className="display-type mt-3 text-4xl leading-tight"
        >
          Welcome back.
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Sign in to continue to your account.
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <div>
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="field-control"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="field-control"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="notice-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
        >
          Back to discovery
        </Link>
      </section>
    </main>
  );
}
