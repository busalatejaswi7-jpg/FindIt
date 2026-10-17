"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, logout, type LoggedInUser } from "../lib/auth";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    startTransition(() => setUser(getUser()));
  }, [pathname]);

  const signOut = () => {
    logout();
    startTransition(() => setUser(null));
    router.push("/login");
  };

  const navigation = (
    <>
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className="site-nav-link"
      >
        Discover
      </Link>
      {user && (
        <Link
          href="/reservations"
          aria-current={pathname === "/reservations" ? "page" : undefined}
          className="site-nav-link"
        >
          Reservations
        </Link>
      )}
      {user?.role === "SHOP_OWNER" && (
        <Link
          href="/owner"
          aria-current={pathname === "/owner" ? "page" : undefined}
          className="site-nav-link"
        >
          Shop workspace
        </Link>
      )}
    </>
  );

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="FINDIT home">
          <span className="brand-mark" aria-hidden="true">
            F
          </span>
          <span className="brand-word">FINDIT</span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {navigation}
        </nav>

        <div className="site-header-actions">
          {user && <span className="site-user-name">{user.name}</span>}
          {user ? (
            <button type="button" className="site-sign-in" onClick={signOut}>
              Sign out
            </button>
          ) : (
            <Link href="/login" className="site-sign-in">
              Sign in
            </Link>
          )}
        </div>

        <details className="mobile-nav">
          <summary aria-label="Open navigation menu">Menu</summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            {navigation}
            {user ? (
              <button type="button" className="site-nav-link" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <Link href="/login" className="site-nav-link">
                Sign in
              </Link>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
