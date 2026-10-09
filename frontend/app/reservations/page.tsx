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

export default function ReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getMyReservations();

        setReservations(data.reservations);
      } catch (error) {
        console.error(
          "Failed to load reservations:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load reservations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Reservations
          </h1>

          <p className="mt-2 text-gray-500">
            Products you have reserved for pickup.
          </p>
        </div>

        {loading && (
          <p className="text-gray-500">
            Loading reservations...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          reservations.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                No reservations yet
              </h2>

              <p className="mt-2 text-gray-500">
                Search for a product and reserve it
                from a nearby shop.
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Find Products
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          reservations.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {reservation.product?.name ??
                          "Product unavailable"}
                      </h2>

                      {reservation.product && (
                        <p className="mt-1 text-sm text-gray-500">
                          {reservation.product.category}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      {reservation.status}
                    </span>
                  </div>

                  {reservation.product?.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {reservation.product.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Shop
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {reservation.shop?.name ??
                        "Shop unavailable"}
                    </p>

                    {reservation.shop && (
                      <p className="mt-1 text-sm text-gray-500">
                        {reservation.shop.address},{" "}
                        {reservation.shop.city}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Quantity
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {reservation.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Reserved on
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {new Date(
                          reservation.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}