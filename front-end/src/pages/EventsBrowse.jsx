import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config/api";

export default function EventsBrowse() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const resRest = await fetch(`${API_URL}/restaurants`);
        const dataRest = await resRest.json();
        if (!resRest.ok) {
          if (!cancelled) setError(dataRest.message || "Failed to load.");
          return;
        }

        const restaurants = dataRest.restaurants || [];
        const now = Date.now();
        const batches = await Promise.all(
          restaurants.map(async (r) => {
            try {
              const res = await fetch(`${API_URL}/events/restaurant/${r.restaurant_id}`);
              const data = await res.json();
              if (!res.ok) return [];
              return (data.events || []).map((ev) => ({
                ...ev,
                restaurant_name: r.name,
              }));
            } catch {
              return [];
            }
          })
        );

        const upcoming = batches
          .flat()
          .filter((ev) => new Date(ev.start_datetime).getTime() >= now)
          .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

        if (!cancelled) setEvents(upcoming);
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
  }, []);

  return (
    <main>
      <header className="page-header">
        <h1>Upcoming events</h1>
        <p>Special evenings and experiences at our partner restaurants.</p>
      </header>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="text-muted">No upcoming events.</p>
      )}

      <section className="card-grid">
        {events.map((ev) => (
          <article key={ev.event_id} className="card">
            <h2>{ev.title}</h2>
            <p className="restaurant-card-meta">{ev.restaurant_name}</p>
            <p className="restaurant-card-meta">
              {new Date(ev.start_datetime).toLocaleString()}
            </p>
            <p className="restaurant-card-meta">
              {ev.price != null && `Price: ${ev.price} · `}
              Max guests: {ev.guest_capacity}
            </p>
            <Link to={`/events/${ev.event_id}`} className="btn btn-primary btn-sm">
              Details & book
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
