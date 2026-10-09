"use client";

import { useState } from "react";
import { createProduct } from "../../../lib/apis";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const product = await createProduct({
        name,
        description,
        category,
      });

      console.log("Created product:", product);

      setMessage("Product created successfully!");

      setName("");
      setDescription("");
      setCategory("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Product
        </h1>

        <p className="mt-2 text-gray-500">
          Add a product to FindIt.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-2"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-2"
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-2"
              placeholder="Enter category"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-600">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}