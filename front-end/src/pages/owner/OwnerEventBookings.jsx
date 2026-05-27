import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

export default function OwnerEventBookings() {
  const { eventId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/eventReservations/forEvent/${eventId}`,
          { headers: jsonAuthHeaders() }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");
        if (!cancelled) setBookings(data.bookings || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <main className="news-page">
      <Link to={`/events/${eventId}`}>← Event</Link>
      <section className="news-hero">
        <h1>Bookings for event #{eventId}</h1>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <section className="news-grid">
        {bookings.map((b) => (
          <article key={b.event_res_id} className="news-item">
            <p><strong>{b.customer_name}</strong> ({b.customer_email})</p>
            <p>Guests: {b.guest_count} · Status: {b.status}</p>
          </article>
        ))}
      </section>
    </main>
  );
}