"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUser,
  logout,
  type LoggedInUser,
} from "../lib/auth";
export default function Home() {
  const router=useRouter();
  const [search,setSearch]=useState("");
const [user,setUser]=useState<LoggedInUser | null>(null);
useEffect(() => {
  setUser(getUser());
}, []);
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-blue-600">
          FindIt
        </h1>

        <div className="flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            How it works
          </a>

          <a
            href="#shops"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Shops
          </a>

        {user ? (
  <>
    <span className="text-sm font-medium text-gray-700">
      Hi, {user.name}
    </span>
    <button
      onClick={() => router.push("/reservations")}
      className="rounded-lg border bg-black text-white border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50"
    >
      My Reservations
    </button>


    <button
      onClick={() => {
        logout();
        setUser(null);
      }}
      className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50"
    >
      Logout
    </button>
  </>
) : (
  <>
    <button
      onClick={() => router.push("/login")}
      className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50"
    >
      Login
    </button>

    <button
      onClick={() => router.push("/login")}
      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Get Started
    </button>
  </>
)}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Find what you need, nearby, right now.
        </p>

        <h2 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight">
          Find products in nearby shops
          <br />
          <span className="text-blue-600">before you go there.</span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-500">
          Search for a product, discover nearby stores that have it in stock,
          and reserve it for pickup.
        </p>

        {/* Search Box */}
        <div className="mt-10 flex w-full max-w-2xl items-center rounded-xl border border-gray-300 bg-white p-2 shadow-lg">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="flex-1 px-4 py-3 text-base outline-none placeholder:text-gray-400"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

          <button 
           onClick={() => {
            if(!search.trim()){
              return;
            }
                router.push(`/search?q=${encodeURIComponent(search)}`);
          }}
        
          className="rounded-lg bg-blue-600 px-7 py-3 font-medium text-white hover:bg-blue-700">
            Search
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Try: laptop charger, medicine, notebook, batteries...
        </p>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-gray-50 px-8 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              How FindIt works
            </h2>

            <p className="mt-3 text-gray-500">
              Find what you need in three simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-600">
                1
              </div>

              <h3 className="text-xl font-semibold">
                Search
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Search for the exact product you need.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-600">
                2
              </div>

              <h3 className="text-xl font-semibold">
                Find nearby
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                See nearby shops and check their current availability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-600">
                3
              </div>

              <h3 className="text-xl font-semibold">
                Reserve & Pick Up
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Reserve the product and pick it up from the shop.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}