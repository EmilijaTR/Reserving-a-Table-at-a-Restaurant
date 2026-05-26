import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import RestaurantCard from "../components/RestaurantCard";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <main className="news-page">
      <section className="news-hero">
        <h1>Restaurants</h1>
        <p>Choose a restaurant to view details and book a table.</p>
      </section>

      {loading && <p>Loading restaurants...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p>No restaurants yet.</p>
      )}

      <section className="news-grid">
        {restaurants.map((r) => (
          <RestaurantCard key={r.restaurant_id} restaurant={r} />
        ))}
      </section>
    </main>
  );
}