
import { getToken } from "./auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function createReservation(data: {
  inventoryId: string;
  quantity: number;
}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to reserve a product");
  }

  const response = await fetch(
    `${API_URL}/api/reservations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create reservation"
    );
  }

  return result;
}
export async function searchProducts(query: string) {
  const response = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return response.json();
}
export async function createProduct(data: {
  name: string;
  description?: string;
  category: string;
  image?: string;
}) {
  const response = await fetch(
    `${API_URL}/api/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  return response.json();
}
export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}
export async function getMyReservations() {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view your reservations");
  }

  const response = await fetch(
    `${API_URL}/api/reservations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to get reservations"
    );
  }

  return result;
}