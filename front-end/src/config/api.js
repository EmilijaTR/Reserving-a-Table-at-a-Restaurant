import { authHeaders } from "./auth";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://88.200.63.148:2653";

export async function uploadRestaurantFile(endpoint, file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/restaurants/${endpoint}`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: "Invalid response from server." };
    }
  }

  if (!res.ok || !data.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }

  return data.path;
}