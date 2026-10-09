"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts, createReservation } from "../../lib/apis";
import { getToken } from "../../lib/auth";
import { useRouter } from "next/navigation";
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
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, SetResults] = useState<SearchResult[]>([]);
  const [loading, SetLoading] = useState(true);
  const [error, SetError] = useState("");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  useEffect(() => {
    if (!query) {
      SetLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const data = await searchProducts(query);

        console.log("api response", data);

        SetResults(data.results);
      } catch (error) {
        console.error(error);
        SetError("Failed to load search results");
      } finally {
        SetLoading(false);
      }
    };

    fetchResults();
  }, [query]);
 const handleReserve = async (inventoryId: string) => {
  const token = getToken();

  if (!token) {
    router.push("/login");
    return;
  }

  setReservingId(inventoryId);

  setReservationStatus((current) => ({
    ...current,
    [inventoryId]: "",
  }));

  try {
    await createReservation({
      inventoryId,
      quantity: 1,
    });

    setReservationStatus((current) => ({
      ...current,
      [inventoryId]: "Product reserved successfully!",
    }));

    SetResults((current) =>
      current.map((result) =>
        result.inventoryId === inventoryId
          ? {
              ...result,
              quantity: result.quantity - 1,
            }
          : result
      )
    );
  } catch (error) {
    console.error("Reservation error:", error);

    setReservationStatus((current) => ({
      ...current,
      [inventoryId]:
        error instanceof Error
          ? error.message
          : "Failed to reserve product",
    }));
  } finally {
    setReservingId(null);
  }
};

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>

        <p className="mt-2 text-gray-500">
          Find products available in nearby shops.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          {loading && <p className="text-gray-500">Loading results...</p>}

          {!loading && error && <p className="text-red-500">{error}</p>}

          {!loading && !error && results.length === 0 && (
            <p className="text-gray-500">No products found.</p>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {results.map((result) => (
                <div
                  key={`${result.productId}-${result.shopId}`}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {result.productName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {result.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {result.quantity} available
                    </span>
                  </div>

                  {result.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {result.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {result.shopName}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {result.address}, {result.city}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      reservingId === result.inventoryId || result.quantity <= 0
                    }
                    onClick={() => handleReserve(result.inventoryId)}
                    className="mt-5 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reservingId === result.inventoryId
                      ? "Reserving..."
                      : result.quantity <= 0
                        ? "out of stock"
                        : "Reserve Product"}
                  </button>
                  {reservationStatus[result.inventoryId] && (
                    <p
                      className={`mt-3 text-sm ${
                        reservationStatus[result.inventoryId].includes(
                          "successfully",
                        )
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {reservationStatus[result.inventoryId]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
