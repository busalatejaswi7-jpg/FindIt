"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createReservation, searchProducts } from "../../lib/apis";
import { getToken } from "../../lib/auth";

type SearchResult = {
  productId: string;
  inventoryId: string;
  productName: string;
  category: string;
  description: string | null;
  shopId: string;
  shopName: string;
  address: string;
  city: string;
  quantity: number;
  updatedAt: string;
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    let cancelled = false;

    if (!query) {
      setResults([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError("");

    const fetchResults = async () => {
      try {
        const data = await searchProducts(query);
        if (!cancelled) {
          setResults(data.results);
        }
      } catch (searchError) {
        if (!cancelled) {
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Failed to load search results",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleReserve = async (inventoryId: string) => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    setReservingId(inventoryId);
    setReservationStatus((current) => ({ ...current, [inventoryId]: "" }));

    try {
      await createReservation({ inventoryId, quantity: 1 });
      setReservationStatus((current) => ({
        ...current,
        [inventoryId]: "Product reserved successfully!",
      }));
      setResults((current) =>
        current.map((result) =>
          result.inventoryId === inventoryId
            ? { ...result, quantity: result.quantity - 1 }
            : result,
        ),
      );
    } catch (reservationError) {
      setReservationStatus((current) => ({
        ...current,
        [inventoryId]:
          reservationError instanceof Error
            ? reservationError.message
            : "Failed to reserve product",
      }));
    } finally {
      setReservingId(null);
    }
  };

  return (
    <main className="page-section">
      <div className="page-wrap">
        <header className="mb-8 border-b border-[var(--line)] pb-6">
          <p className="section-kicker">Product discovery</p>
          <h1 className="display-type mt-3 text-4xl leading-tight sm:text-5xl">
            Search results
          </h1>
          {query ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Matching <span className="font-semibold text-[var(--ink)]">“{query}”</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Search for a product or category to see local availability.
            </p>
          )}
        </header>

        {loading && (
          <div className="surface-panel p-6" aria-live="polite" aria-busy="true">
            <p className="text-sm text-[var(--muted)]">Searching shop inventory...</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-md bg-[var(--brand-soft)]"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="notice-error" role="alert">
            <p className="font-semibold">Search could not be completed</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="button-secondary mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && !query && (
          <div className="surface-panel px-6 py-12 text-center sm:px-10">
            <p className="section-kicker">Start with a search</p>
            <h2 className="display-type mt-3 text-3xl">What do you need?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Enter a product name or category on the discovery page to see
              available shop inventory.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="button-primary mt-6"
            >
              Go to discovery
            </button>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="surface-panel px-6 py-12 text-center sm:px-10">
            <p className="section-kicker">No matches</p>
            <h2 className="display-type mt-3 text-3xl">Nothing found for that search.</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try another product name or category.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="button-secondary mt-6"
            >
              Search again
            </button>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]" aria-live="polite">
              {results.length} {results.length === 1 ? "shop listing" : "shop listings"}
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((result) => {
                const unavailable = result.quantity <= 0;
                const lowStock = result.quantity > 0 && result.quantity <= 5;

                return (
                  <article
                    key={`${result.productId}-${result.shopId}`}
                    className="surface-panel flex min-w-0 flex-col p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="section-kicker">{result.category}</p>
                        <h2 className="display-type mt-2 break-words text-2xl leading-tight">
                          {result.productName}
                        </h2>
                      </div>
                      <span
                        className={`status-badge ${
                          unavailable
                            ? "status-empty"
                            : lowStock
                              ? "status-low"
                              : "status-available"
                        }`}
                      >
                        {unavailable
                          ? "Out of stock"
                          : lowStock
                            ? `${result.quantity} left`
                            : `${result.quantity} available`}
                      </span>
                    </div>

                    {result.description && (
                      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                        {result.description}
                      </p>
                    )}

                    <div className="mt-5 border-t border-[var(--line)] pt-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                        Available at
                      </p>
                      <h3 className="mt-1 break-words font-semibold text-[var(--ink)]">
                        {result.shopName}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                        {result.address}, {result.city}
                      </p>
                    </div>

                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        disabled={reservingId === result.inventoryId || unavailable}
                        onClick={() => handleReserve(result.inventoryId)}
                        className="button-primary w-full"
                      >
                        {reservingId === result.inventoryId
                          ? "Reserving..."
                          : unavailable
                            ? "Unavailable"
                            : "Reserve for pickup"}
                      </button>
                      {reservationStatus[result.inventoryId] && (
                        <p
                          role="status"
                          className={`mt-3 text-sm ${
                            reservationStatus[result.inventoryId].includes(
                              "successfully",
                            )
                              ? "text-[var(--positive)]"
                              : "text-[var(--danger)]"
                          }`}
                        >
                          {reservationStatus[result.inventoryId]}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="page-section">
          <div className="page-wrap text-sm text-[var(--muted)]" aria-live="polite">
            Loading search results...
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
