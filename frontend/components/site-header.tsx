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

  const navigation = [
    { href: "/", label: "Discover" },
    { href: "/search", label: "Search" },
    { href: "/reservations", label: "Reservations" },
    { href: "/owner", label: "Shop workspace" },
    { href: "/products/create", label: "Add product" },
  ];

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
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="site-nav-link"
            >
              {item.label}
            </Link>
          ))}
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
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="site-nav-link"
              >
                {item.label}
              </Link>
            ))}
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
