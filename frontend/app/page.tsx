"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, type LoggedInUser } from "../lib/auth";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    startTransition(() => setUser(getUser()));

    const query = new URLSearchParams(window.location.search).get("q")?.trim();
    if (query) {
      router.replace(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [router]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main>
      <section className="home-hero">
        <div className="home-hero-inner">
          <p className="home-kicker">
            FINDIT <span>/</span> LOCAL DISCOVERY
          </p>
          <h1 className="display-type mt-5 max-w-4xl text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
            Find the right thing.
            <br />
            <span className="home-hero-accent">Close to home.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Search product names or categories across local shop inventory. Check
            what is available, then reserve it for pickup.
          </p>

          <form className="hero-search mt-9" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="product-search">
              Search products and categories
            </label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What are you looking for?"
              autoComplete="off"
            />
            <button type="submit" className="button-primary">
              Search stock
            </button>
          </form>

          <div className="home-sequence" aria-label="Findit process">
            <span>Search</span>
            <span aria-hidden="true">/</span>
            <span>Check availability</span>
            <span aria-hidden="true">/</span>
            <span>Reserve for pickup</span>
          </div>
          {user?.role === "SHOP_OWNER" && (
            <p className="mt-7 text-sm text-white/80">
              Managing a shop?{" "}
              <button
                type="button"
                onClick={() => router.push("/owner")}
                className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
              >
                Open your shop workspace
              </button>
            </p>
          )}
        </div>
      </section>

      <section id="how-it-works" className="page-section">
        <div className="page-wrap">
          <div className="mb-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="section-kicker">A simple local loop</p>
              <h2 className="display-type mt-3 text-4xl leading-tight sm:text-5xl">
                From search
                <br />
                to pickup.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)]">
              Find products stocked by physical shops, compare availability,
              and keep your reservation details in one place.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-step">
              <p className="section-kicker">01</p>
              <h3 className="mt-5 text-lg font-semibold">Search what you need</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">
                Look up a product by name or category.
              </p>
            </article>
            <article className="process-step">
              <p className="section-kicker">02</p>
              <h3 className="mt-5 text-lg font-semibold">Check shop stock</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">
                Review available quantity and the shop location.
              </p>
            </article>
            <article className="process-step">
              <p className="section-kicker">03</p>
              <h3 className="mt-5 text-lg font-semibold">Reserve for pickup</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">
                Sign in to reserve and revisit it in your reservations.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--brand-soft)] py-12 sm:py-16">
        <div className="page-wrap">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Explore FINDIT</p>
              <h2 className="display-type mt-2 text-3xl sm:text-4xl">
                Go straight to a workspace.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
              Discovery, reservations, and shop tools are all part of the same
              local marketplace.
            </p>
          </div>

          <nav
            aria-label="Explore FINDIT pages"
            className="grid border-y border-[var(--line)] sm:grid-cols-2 lg:grid-cols-5"
          >
            {[
              { href: "/search", label: "Search", detail: "Find local stock" },
              {
                href: "/reservations",
                label: "Reservations",
                detail: "View pickup holds",
              },
              {
                href: "/owner",
                label: "Shop workspace",
                detail: "Manage locations",
              },
              {
                href: "/products/create",
                label: "Add product",
                detail: "Update the catalog",
              },
              { href: "/login", label: "Sign in", detail: "Access your account" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-28 flex-col justify-between border-b border-[var(--line)] px-4 py-4 transition-colors hover:bg-white sm:border-r lg:border-b-0 lg:last:border-r-0"
              >
                <span className="font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                  {item.label}
                </span>
                <span className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  {item.detail}
                  <span aria-hidden="true" className="text-[var(--coral)]">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
