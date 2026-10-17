"use client";

import { useState } from "react";
import Link from "next/link";
import { createProduct } from "../../../lib/apis";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await createProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
      });

      setMessage("Product created successfully.");
      setName("");
      setDescription("");
      setCategory("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section">
      <div className="page-wrap max-w-3xl">
        <header className="mb-8 border-b border-[var(--line)] pb-6">
          <p className="section-kicker">Catalog</p>
          <h1 className="display-type mt-3 text-4xl leading-tight sm:text-5xl">
            Create a product
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Add product details to the FINDIT catalog.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="surface-panel space-y-5 p-5 sm:p-7">
          <div>
            <label className="field-label" htmlFor="product-name">
              Product name
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field-control"
              placeholder="Enter product name"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="product-category">
              Category
            </label>
            <input
              id="product-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field-control"
              placeholder="Enter category"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="product-description">
              Description <span className="font-normal text-[var(--muted)]">(optional)</span>
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field-control min-h-32 resize-y"
              placeholder="Add a product description"
              rows={4}
            />
          </div>

          {error && <p className="notice-error" role="alert">{error}</p>}
          {message && <p className="notice-success" role="status">{message}</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5">
            <button type="submit" disabled={loading} className="button-primary">
              {loading ? "Creating..." : "Create product"}
            </button>
            <Link href="/owner" className="button-secondary">
              Back to shop workspace
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
