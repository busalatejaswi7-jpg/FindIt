"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyReservations } from "../../lib/apis";
import { getToken } from "../../lib/auth";

type Reservation = {
  id: string;
  quantity: number;
  status: string;
  createdAt: string;
  inventoryId: string;
  product: {
    id: string;
    name: string;
    category: string;
    description: string | null;
  } | null;
  shop: {
    id: string;
    name: string;
    address: string;
    city: string;
  } | null;
};

const statusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "status-confirmed";
    case "PENDING":
      return "status-pending";
    case "CANCELLED":
      return "status-cancelled";
    default:
      return "status-badge";
  }
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchReservations = async () => {
      if (!getToken()) {
        router.push("/login");
        return;
      }

      try {
        const data = await getMyReservations();
        if (!cancelled) {
          setReservations(data.reservations);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load reservations",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReservations();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="page-section">
      <div className="page-wrap">
        <header className="mb-8 border-b border-[var(--line)] pb-6">
          <p className="section-kicker">Your account</p>
          <h1 className="display-type mt-3 text-4xl leading-tight sm:text-5xl">
            Reservations
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Your products reserved for pickup.
          </p>
        </header>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2" aria-live="polite" aria-busy="true">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="surface-panel h-52 animate-pulse bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="notice-error" role="alert">
            <p className="font-semibold">Reservations could not be loaded</p>
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

        {!loading && !error && reservations.length === 0 && (
          <section className="surface-panel px-6 py-12 text-center sm:px-10">
            <p className="section-kicker">Nothing reserved yet</p>
            <h2 className="display-type mt-3 text-3xl">Your list starts here.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Find a product in shop inventory and reserve it for pickup.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="button-primary mt-6"
            >
              Find a product
            </button>
          </section>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="surface-panel reservation-card flex min-w-0 flex-col p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="section-kicker">
                      {reservation.product?.category ?? "Reservation"}
                    </p>
                    <h2 className="display-type mt-2 break-words text-2xl leading-tight">
                      {reservation.product?.name ?? "Product unavailable"}
                    </h2>
                  </div>
                  <span className={statusClass(reservation.status)}>
                    {reservation.status}
                  </span>
                </div>

                {reservation.product?.description && (
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    {reservation.product.description}
                  </p>
                )}

                <div className="mt-5 border-t border-[var(--line)] pt-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Pickup shop
                  </p>
                  <h3 className="mt-1 break-words font-semibold text-[var(--ink)]">
                    {reservation.shop?.name ?? "Shop unavailable"}
                  </h3>
                  {reservation.shop && (
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      {reservation.shop.address}, {reservation.shop.city}
                    </p>
                  )}
                </div>

                <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
                  <div>
                    <dt className="text-xs font-medium text-[var(--muted)]">
                      Quantity
                    </dt>
                    <dd className="mt-1 font-semibold">{reservation.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[var(--muted)]">
                      Reserved on
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      <time dateTime={reservation.createdAt}>
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </time>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
