import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL } from "../config/api";

export default function RestaurantEvents() {
  const { id: restaurantId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/events/restaurant/${restaurantId}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.message || "Failed to load events.");
          return;
        }
        if (!cancelled) setEvents(data.events || []);
      } catch (err) {
        console.log(err);
        if (!cancelled) setError("Could not load events.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return (
    <main className="news-page">
      <Link to={`/restaurants/${restaurantId}`}>← Restaurant</Link>

      <section className="news-hero">
        <h1>Events</h1>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && events.length === 0 && <p>No upcoming events.</p>}

      <section className="news-grid">
        {events.map((ev) => (
          <article key={ev.event_id} className="news-item">
            <h2>{ev.title}</h2>
            <p>{new Date(ev.start_datetime).toLocaleString()}</p>
            <p>Price: {ev.price} · Max guests: {ev.guest_capacity}</p>
            <Link to={`/events/${ev.event_id}`}>Details & book</Link>
          </article>
        ))}
      </section>
    </main>
  );
}