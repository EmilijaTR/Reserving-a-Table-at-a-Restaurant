import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { API_URL } from "../config/api";
import RestaurantCard from "../components/RestaurantCard";

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const where = (searchParams.get("where") || "").trim().toLowerCase();
  const when = searchParams.get("when") || "";
  const guests = searchParams.get("guests") || "";

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!where) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const address = (r.address || "").toLowerCase();
      return name.includes(where) || address.includes(where);
    });
  }, [restaurants, where]);

  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/restaurants`);
        const text = await res.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            setError("Invalid response from server.");
            return;
          }
        }

        if (!res.ok) {
          setError(data.message || `Error ${res.status}`);
          return;
        }

        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.log("Error loading restaurants:", err);
        setError("Could not load restaurants. Check API_URL and backend.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  return (
    <main>
      <header className="page-header">
        <h1>Restaurants</h1>
        <p>Choose a restaurant to view details, menu, and book a table.</p>
        {(where || when || guests) && (
          <p className="text-muted" style={{ marginTop: "8px" }}>
            {where && <>Search: <strong>{searchParams.get("where")}</strong></>}
            {when && <> · Date: <strong>{when}</strong></>}
            {guests && <> · Guests: <strong>{guests}</strong></>}
          </p>
        )}
      </header>

      {loading && <p className="text-muted">Loading restaurants…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p className="text-muted">No restaurants yet.</p>
      )}

      {!loading && !error && restaurants.length > 0 && filtered.length === 0 && (
        <p className="text-muted">No restaurants match your search.</p>
      )}

      <section className="card-grid">
        {filtered.map((r) => (
          <RestaurantCard key={r.restaurant_id} restaurant={r} />
        ))}
      </section>
    </main>
  );
}
