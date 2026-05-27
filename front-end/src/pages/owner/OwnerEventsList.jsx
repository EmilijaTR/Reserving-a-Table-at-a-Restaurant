import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

export default function OwnerEventsList() {
  const { id: restaurantId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch(`${API_URL}/events/restaurant/${restaurantId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Load failed");
    setEvents(data.events || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleDelete(eventId) {
    if (!window.confirm("Delete this event?")) return;
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: jsonAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage("Event deleted.");
        await load();
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch (err) {
      setMessage("Delete error.");
    }
  }

  return (
    <main className="news-page">
      <Link to="/owner/restaurants">← My restaurants</Link>

      <section className="news-hero">
        <h1>Events for restaurant #{restaurantId}</h1>
        <p>
          <Link to={`/owner/restaurants/${restaurantId}/events/new`}>
            + Create event
          </Link>
        </p>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <section className="news-grid">
        {events.map((ev) => (
          <article key={ev.event_id} className="news-item">
            <h2>{ev.title}</h2>
            <p>{new Date(ev.start_datetime).toLocaleString()}</p>
            <p>
              <Link to={`/owner/events/${ev.event_id}/bookings`}>Bookings</Link>
              {" · "}
              <Link to={`/owner/restaurants/${restaurantId}/events/${ev.event_id}/edit`}>
                Edit
              </Link>
              {" · "}
              <button type="button" onClick={() => handleDelete(ev.event_id)}>
                Delete
              </button>
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}