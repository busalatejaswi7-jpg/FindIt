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

    if (!stockQuantity.trim()) {
      setStockError("Enter a stock quantity.");
      return;
    }

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
    <main className="page-section">
      <div className="page-wrap">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
          <div>
            <p className="section-kicker">Shop workspace</p>
            <h1 className="display-type mt-3 text-4xl leading-tight sm:text-5xl">
              Inventory overview
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Manage shop locations, product listings, and current stock.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="button-secondary"
          >
            Back to discovery
          </button>
        </header>

        {loading && (
          <div
            className="grid gap-4 md:grid-cols-3"
            aria-live="polite"
            aria-busy="true"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="surface-panel h-28 animate-pulse bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="notice-error" role="alert">
            <p className="font-semibold">Workspace could not be loaded</p>
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

        {!loading && !error && (
          <div className="space-y-8">
            <section
              className="surface-panel p-5 sm:p-7"
              aria-labelledby="create-shop-heading"
            >
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-kicker">Location</p>
                  <h2
                    id="create-shop-heading"
                    className="mt-2 text-xl font-semibold"
                  >
                    Register a shop
                  </h2>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Coordinates help identify the location.
                </p>
              </div>

              <form
                onSubmit={handleCreateShop}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <label className="block">
                  <span className="field-label">Shop name</span>
                  <input
                    required
                    value={shopForm.name}
                    onChange={(event) =>
                      setShopForm({ ...shopForm, name: event.target.value })
                    }
                    className="field-control"
                    autoComplete="organization"
                  />
                </label>
                <label className="block sm:col-span-2 lg:col-span-1">
                  <span className="field-label">Address</span>
                  <input
                    required
                    value={shopForm.address}
                    onChange={(event) =>
                      setShopForm({ ...shopForm, address: event.target.value })
                    }
                    className="field-control"
                    autoComplete="street-address"
                  />
                </label>
                <label className="block">
                  <span className="field-label">City</span>
                  <input
                    required
                    value={shopForm.city}
                    onChange={(event) =>
                      setShopForm({ ...shopForm, city: event.target.value })
                    }
                    className="field-control"
                    autoComplete="address-level2"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Latitude</span>
                  <input
                    required
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={shopForm.latitude}
                    onChange={(event) =>
                      setShopForm({ ...shopForm, latitude: event.target.value })
                    }
                    className="field-control"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Longitude</span>
                  <input
                    required
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={shopForm.longitude}
                    onChange={(event) =>
                      setShopForm({
                        ...shopForm,
                        longitude: event.target.value,
                      })
                    }
                    className="field-control"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
                  {shopError && (
                    <p role="alert" className="notice-error w-full">
                      {shopError}
                    </p>
                  )}
                  {shopMessage && (
                    <p role="status" className="notice-success w-full">
                      {shopMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={creatingShop}
                    className="button-primary"
                  >
                    {creatingShop ? "Creating shop..." : "Create shop"}
                  </button>
                </div>
              </form>
            </section>

            <section
              className="surface-panel p-5 sm:p-7"
              aria-labelledby="add-product-heading"
            >
              <div className="mb-6">
                <p className="section-kicker">Catalog and stock</p>
                <h2
                  id="add-product-heading"
                  className="mt-2 text-xl font-semibold"
                >
                  Add product to a shop
                </h2>
              </div>

              {shops.length === 0 ? (
                <p className="notice-info">
                  Create a shop before adding products.
                </p>
              ) : (
                <form
                  onSubmit={handleCreateProduct}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <label className="block">
                    <span className="field-label">Shop</span>
                    <select
                      required
                      value={productForm.shopId}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          shopId: event.target.value,
                        })
                      }
                      className="field-control"
                    >
                      <option value="">Select a shop</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name} — {shop.city}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">Product name</span>
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          name: event.target.value,
                        })
                      }
                      className="field-control"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Category</span>
                    <input
                      required
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          category: event.target.value,
                        })
                      }
                      className="field-control"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Available quantity</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={productForm.quantity}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          quantity: event.target.value,
                        })
                      }
                      className="field-control"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">
                      Description{" "}
                      <span className="font-normal text-[var(--muted)]">
                        (optional)
                      </span>
                    </span>
                    <input
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          description: event.target.value,
                        })
                      }
                      className="field-control"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">
                      Image URL{" "}
                      <span className="font-normal text-[var(--muted)]">
                        (optional)
                      </span>
                    </span>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          image: event.target.value,
                        })
                      }
                      className="field-control"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
                    {productError && (
                      <p role="alert" className="notice-error w-full">
                        {productError}
                      </p>
                    )}
                    {productMessage && (
                      <p role="status" className="notice-success w-full">
                        {productMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={creatingProduct}
                      className="button-primary"
                    >
                      {creatingProduct
                        ? "Adding product..."
                        : "Add product and stock"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            <section
              aria-label="Inventory summary"
              className="grid gap-3 sm:grid-cols-3"
            >
              <div className="surface-panel border-t-2 border-t-[var(--coral)] p-5">
                <p className="text-sm font-medium text-[var(--muted)]">
                  My shops
                </p>
                <p className="display-type mt-2 text-4xl">{shops.length}</p>
              </div>
              <div className="surface-panel p-5">
                <p className="text-sm font-medium text-[var(--muted)]">
                  Product listings
                </p>
                <p className="display-type mt-2 text-4xl">{totalProducts}</p>
              </div>
              <div className="surface-panel p-5">
                <p className="text-sm font-medium text-[var(--muted)]">
                  Units in stock
                </p>
                <p className="display-type mt-2 text-4xl">{totalUnits}</p>
              </div>
            </section>

            {stockError && (
              <p role="alert" className="notice-error">
                {stockError}
              </p>
            )}
            {stockMessage && (
              <p role="status" className="notice-success">
                {stockMessage}
              </p>
            )}

            {shops.length === 0 ? (
              <section className="surface-panel px-6 py-12 text-center sm:px-10">
                <p className="section-kicker">No locations yet</p>
                <h2 className="display-type mt-3 text-3xl">
                  Your first shop starts here.
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Add a shop above to begin managing its inventory.
                </p>
              </section>
            ) : (
              <section aria-labelledby="shops-heading" className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="section-kicker">Locations</p>
                    <h2
                      id="shops-heading"
                      className="mt-2 text-xl font-semibold"
                    >
                      Your shops
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {shops.length}{" "}
                    {shops.length === 1 ? "location" : "locations"}
                  </p>
                </div>

                {shops.map((shop) => (
                  <article
                    key={shop.id}
                    className="surface-panel overflow-hidden"
                  >
                    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] p-5 sm:p-6">
                      <div className="min-w-0">
                        <h3 className="display-type break-words text-2xl">
                          {shop.name}
                        </h3>
                        <p className="mt-2 break-words text-sm text-[var(--muted)]">
                          {shop.address}, {shop.city}
                        </p>
                      </div>
                      <span className="status-badge status-available">
                        {shop.inventory.length}{" "}
                        {shop.inventory.length === 1 ? "listing" : "listings"}
                      </span>
                    </header>

                    {shop.inventory.length === 0 ? (
                      <p className="px-5 py-8 text-sm text-[var(--muted)] sm:px-6">
                        No inventory listings at this shop yet.
                      </p>
                    ) : (
                      <div
                        className="overflow-x-auto"
                        role="region"
                        aria-label={`Inventory for ${shop.name}`}
                        tabIndex={0}
                      >
                        <table className="inventory-table">
                          <thead>
                            <tr>
                              <th scope="col">Product</th>
                              <th scope="col">Category</th>
                              <th scope="col">Available</th>
                              <th scope="col">Stock status</th>
                              <th scope="col">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shop.inventory.map((item) => {
                              const unavailable = item.quantity <= 0;
                              const lowStock =
                                item.quantity > 0 && item.quantity <= 5;

                              return (
                                <tr key={item.inventoryId}>
                                  <td>
                                    <p className="break-words font-semibold text-[var(--ink)]">
                                      {item.productName}
                                    </p>
                                    {item.description && (
                                      <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--muted)]">
                                        {item.description}
                                      </p>
                                    )}
                                  </td>
                                  <td className="text-[var(--muted)]">
                                    {item.category}
                                  </td>
                                  <td className="font-semibold tabular-nums">
                                    {item.quantity}
                                  </td>
                                  <td>
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
                                          ? "Low stock"
                                          : "Available"}
                                    </span>
                                  </td>
                                  <td>
                                    {editingInventoryId === item.inventoryId ? (
                                      <form
                                        onSubmit={(event) =>
                                          handleUpdateStock(
                                            event,
                                            item.inventoryId,
                                          )
                                        }
                                        className="flex flex-wrap items-center gap-2"
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
                                          className="field-control w-24"
                                        />
                                        <button
                                          type="submit"
                                          disabled={
                                            updatingInventoryId ===
                                            item.inventoryId
                                          }
                                          className="button-primary min-h-9 px-3 py-2 text-xs"
                                        >
                                          {updatingInventoryId ===
                                          item.inventoryId
                                            ? "Saving..."
                                            : "Save"}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={
                                            updatingInventoryId ===
                                            item.inventoryId
                                          }
                                          onClick={() => {
                                            setEditingInventoryId(null);
                                            setStockQuantity("");
                                            setStockError("");
                                          }}
                                          className="button-secondary min-h-9 px-3 py-2 text-xs"
                                        >
                                          Cancel
                                        </button>
                                      </form>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingInventoryId(
                                            item.inventoryId,
                                          );
                                          setStockQuantity(
                                            String(item.quantity),
                                          );
                                          setStockError("");
                                          setStockMessage("");
                                        }}
                                        className="button-secondary min-h-9 px-3 py-2 text-xs"
                                      >
                                        Edit stock
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
