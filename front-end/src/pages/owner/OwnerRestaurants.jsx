import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

export default function OwnerRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      try {
        const res = await fetch(`${API_URL}/restaurants/mine`, {
          headers: jsonAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.message || "Failed to load.");
          return;
        }
        if (!cancelled) setRestaurants(data.restaurants || []);
      } catch (err) {
        console.log(err);
        if (!cancelled) setError("Could not load restaurants.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="news-page">
      <section className="news-hero">
        <h1>My restaurants</h1>
        <p>
          <Link to="/owner/restaurants/new">+ Add restaurant</Link>
        </p>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p>No restaurants yet. Create one to get started.</p>
      )}

      <section className="news-grid">
        {restaurants.map((r) => (
          <article key={r.restaurant_id} className="news-item">
            <h2>{r.name}</h2>
            <p>{r.address}</p>
            <p>Capacity: {r.guest_capacity}</p>
            <p>
              <Link to={`/owner/restaurants/${r.restaurant_id}/reservations`}>
                  Reservations
              </Link>
              {" · "}
              <Link to={`/owner/restaurants/${r.restaurant_id}/edit`}>
                Edit profile
              </Link>
              <Link to={`/owner/restaurants/${r.restaurant_id}/events`}>
                Events
              </Link>
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}