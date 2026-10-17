"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/auth";
import {
  createInventory,
  createProduct,
  createShop,
  getShopDashboard,
  updateInventoryQuantity,
} from "../../lib/apis";
type ShopInventoryItem = {
  inventoryId: string;
  productId: string;
  productName: string;
  category: string;
  description: string | null;
  quantity: number;
  updatedAt: string;
};

type OwnerShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  inventory: ShopInventoryItem[];
};

export default function ShopOwnerDashboard() {
  const router = useRouter();

  const [shops, setShops] = useState<OwnerShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shopForm, setShopForm] = useState({
    name: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
  });

  const [creatingShop, setCreatingShop] = useState(false);
  const [shopMessage, setShopMessage] = useState("");
  const [shopError, setShopError] = useState("");
  const [productForm, setProductForm] = useState({
    shopId: "",
    name: "",
    category: "",
    description: "",
    image: "",
    quantity: "1",
  });

  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null,
  );
  const [stockQuantity, setStockQuantity] = useState("");
  const [updatingInventoryId, setUpdatingInventoryId] = useState<string | null>(
    null,
  );
  const [stockMessage, setStockMessage] = useState("");
  const [stockError, setStockError] = useState("");
  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getShopDashboard();

        if (!cancelled) {
          setShops(data.shops);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load shop dashboard",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);
  const handleCreateShop = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShopMessage("");
    setShopError("");

    const latitude = Number(shopForm.latitude);
    const longitude = Number(shopForm.longitude);

    if (
      !shopForm.name.trim() ||
      !shopForm.address.trim() ||
      !shopForm.city.trim() ||
      shopForm.latitude.trim() === "" ||
      shopForm.longitude.trim() === "" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setShopError("Enter valid shop details and coordinates.");
      return;
    }

    setCreatingShop(true);

    try {
      await createShop({
        name: shopForm.name.trim(),
        address: shopForm.address.trim(),
        city: shopForm.city.trim(),
        latitude,
        longitude,
      });

      const data = await getShopDashboard();
      setShops(data.shops);

      setShopForm({
        name: "",
        address: "",
        city: "",
        latitude: "",
        longitude: "",
      });

      setShopMessage("Shop created successfully!");
    } catch (err) {
      setShopError(
        err instanceof Error ? err.message : "Failed to create shop",
      );
    } finally {
      setCreatingShop(false);
    }
  };
  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setProductMessage("");
    setProductError("");

    const quantity = Number(productForm.quantity);

    if (!productForm.shopId) {
      setProductError("Please select a shop.");
      return;
    }

    if (
      !productForm.name.trim() ||
      !productForm.category.trim() ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setProductError(
        "Enter a product name, category, and valid non-negative stock quantity.",
      );
      return;
    }

    setCreatingProduct(true);

    try {
      const product = await createProduct({
        name: productForm.name.trim(),
        category: productForm.category.trim(),
        description: productForm.description.trim() || undefined,
        image: productForm.image.trim() || undefined,
      });

      const productId = product.id ?? product.product?.id;

      if (typeof productId !== "string" || !productId) {
        throw new Error(
          "Product was created, but the API did not return its ID. Check the product response before retrying.",
        );
      }

      await createInventory({
        shopId: productForm.shopId,
        productId,
        quantity,
      });

      const data = await getShopDashboard();
      setShops(data.shops);

      setProductForm({
        shopId: "",
        name: "",
        category: "",
        description: "",
        image: "",
        quantity: "1",
      });

      setProductMessage("Product and inventory added successfully!");
    } catch (err) {
      setProductError(
        err instanceof Error
          ? err.message
          : "Failed to create product and inventory.",
      );
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleUpdateStock = async (
    event: React.FormEvent<HTMLFormElement>,
    inventoryId: string,
  ) => {
    event.preventDefault();
    setStockError("");
    setStockMessage("");

    const quantity = Number(stockQuantity);

    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      setStockError("Quantity must be a non-negative integer.");
      return;
    }

    setUpdatingInventoryId(inventoryId);

    try {
      const updatedInventory = await updateInventoryQuantity({
        inventoryId,
        quantity,
      });
      const savedQuantity = updatedInventory.quantity ?? quantity;

      setShops((currentShops) =>
        currentShops.map((shop) => ({
          ...shop,
          inventory: shop.inventory.map((item) =>
            item.inventoryId === inventoryId
              ? { ...item, quantity: savedQuantity }
              : item,
          ),
        })),
      );
      setEditingInventoryId(null);
      setStockQuantity("");
      setStockMessage("Stock updated successfully.");
    } catch (err) {
      setStockError(
        err instanceof Error ? err.message : "Failed to update stock.",
      );
    } finally {
      setUpdatingInventoryId(null);
    }
  };

  const totalProducts = shops.reduce(
    (total, shop) => total + shop.inventory.length,
    0,
  );

  const totalUnits = shops.reduce(
    (total, shop) =>
      total + shop.inventory.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              FINDIT FOR BUSINESS
            </p>

            <h1 className="mt-2 text-3xl font-bold">Shop Owner Dashboard</h1>

            <p className="mt-2 text-gray-500">
              Manage your shops and monitor your stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Back to FindIt
          </button>
        </div>

        {loading && (
          <p className="mt-10 text-gray-500">
            Loading your shops and inventory...
          </p>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Could not load dashboard
            </p>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Create Shop</h2>

              <p className="mt-1 text-sm text-gray-500">
                Register your physical shop on FindIt.
              </p>

              <form
                onSubmit={handleCreateShop}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  required
                  placeholder="Shop name"
                  value={shopForm.name}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, name: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <input
                  required
                  placeholder="Address"
                  value={shopForm.address}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, address: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <input
                  required
                  placeholder="City"
                  value={shopForm.city}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, city: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <input
                  required
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="Latitude"
                  value={shopForm.latitude}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, latitude: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <input
                  required
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="Longitude"
                  value={shopForm.longitude}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, longitude: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-3"
                />

                <div className="sm:col-span-2">
                  {shopError && (
                    <p role="alert" className="mb-3 text-sm text-red-600">
                      {shopError}
                    </p>
                  )}

                  {shopMessage && (
                    <p role="status" className="mb-3 text-sm text-green-700">
                      {shopMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={creatingShop}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creatingShop ? "Creating shop..." : "Create Shop"}
                  </button>
                </div>
              </form>
            </section>

            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Add Product & Stock</h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a product to one of your shops and set its available
                quantity.
              </p>

              {shops.length === 0 ? (
                <p className="mt-4 text-sm text-amber-700">
                  Create a shop before adding products.
                </p>
              ) : (
                <form
                  onSubmit={handleCreateProduct}
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                >
                  <select
                    required
                    value={productForm.shopId}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        shopId: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="">Select your shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} — {shop.city}
                      </option>
                    ))}
                  </select>

                  <input
                    required
                    placeholder="Product name"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <input
                    required
                    placeholder="Category"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="Available quantity"
                    value={productForm.quantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        quantity: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <input
                    placeholder="Description (optional)"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <div className="sm:col-span-2">
                    {productError && (
                      <p role="alert" className="mb-3 text-sm text-red-600">
                        {productError}
                      </p>
                    )}

                    {productMessage && (
                      <p role="status" className="mb-3 text-sm text-green-700">
                        {productMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={creatingProduct}
                      className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {creatingProduct ? "Adding product..." : "Add Product"}
                    </button>
                  </div>
                </form>
              )}
            </section>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-gray-500">My Shops</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {shops.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Registered locations
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Product Listings</p>
                <p className="mt-2 text-3xl font-bold">{totalProducts}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">Total Units in Stock</p>
                <p className="mt-2 text-3xl font-bold">{totalUnits}</p>
              </div>
            </div>

            {stockError && (
              <p role="alert" className="mt-5 text-sm text-red-600">
                {stockError}
              </p>
            )}

            {stockMessage && (
              <p role="status" className="mt-5 text-sm text-green-700">
                {stockMessage}
              </p>
            )}

            {shops.length === 0 ? (
              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold">No shops found</h2>

                <p className="mt-2 text-gray-500">
                  No shops are currently linked to this shop-owner account.
                </p>
              </div>
            ) : (
              <div className="mt-10 space-y-8">
                {shops.map((shop) => (
                  <section
                    key={shop.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-gray-100 p-6">
                      <h2 className="text-xl font-bold">{shop.name}</h2>

                      <p className="mt-2 text-sm text-gray-500">
                        {shop.address}, {shop.city}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {shop.inventory.length} product listings
                      </p>
                    </div>

                    {shop.inventory.length === 0 ? (
                      <p className="p-6 text-sm text-gray-500">
                        This shop has no inventory listings yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="px-6 py-4 font-medium">Product</th>
                              <th className="px-6 py-4 font-medium">
                                Category
                              </th>
                              <th className="px-6 py-4 font-medium">
                                Available
                              </th>
                              <th className="px-6 py-4 font-medium">
                                Stock status
                              </th>
                              <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {shop.inventory.map((item) => (
                              <tr
                                key={item.inventoryId}
                                className="border-t border-gray-100"
                              >
                                <td className="px-6 py-4">
                                  <p className="font-semibold">
                                    {item.productName}
                                  </p>

                                  {item.description && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {item.description}
                                    </p>
                                  )}
                                </td>

                                <td className="px-6 py-4 text-gray-600">
                                  {item.category}
                                </td>

                                <td className="px-6 py-4 font-semibold">
                                  {item.quantity}
                                </td>

                                <td className="px-6 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                      item.quantity <= 0
                                        ? "bg-red-100 text-red-700"
                                        : item.quantity <= 5
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {item.quantity <= 0
                                      ? "Out of stock"
                                      : item.quantity <= 5
                                        ? "Low stock"
                                        : "In stock"}
                                  </span>
                                </td>

                                <td className="px-6 py-4">
                                  {editingInventoryId === item.inventoryId ? (
                                    <form
                                      onSubmit={(event) =>
                                        handleUpdateStock(event, item.inventoryId)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                        aria-label={`New stock quantity for ${item.productName}`}
                                        value={stockQuantity}
                                        onChange={(event) =>
                                          setStockQuantity(event.target.value)
                                        }
                                        className="w-24 rounded-md border border-gray-300 px-2 py-1"
                                      />
                                      <button
                                        type="submit"
                                        disabled={
                                          updatingInventoryId === item.inventoryId
                                        }
                                        className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                      >
                                        {updatingInventoryId === item.inventoryId
                                          ? "Saving..."
                                          : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          updatingInventoryId === item.inventoryId
                                        }
                                        onClick={() => {
                                          setEditingInventoryId(null);
                                          setStockQuantity("");
                                          setStockError("");
                                        }}
                                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-60"
                                      >
                                        Cancel
                                      </button>
                                    </form>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingInventoryId(item.inventoryId);
                                        setStockQuantity(String(item.quantity));
                                        setStockError("");
                                        setStockMessage("");
                                      }}
                                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                                    >
                                      Edit Stock
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
