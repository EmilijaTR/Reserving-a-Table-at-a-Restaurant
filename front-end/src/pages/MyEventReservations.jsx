import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser, jsonAuthHeaders } from "../config/auth";

export default function MyEventReservations() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userId = user?.user_id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setError("");
    try {
      const res = await fetch(`${API_URL}/eventReservations/mine`, {
        headers: jsonAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load.");
        return;
      }
      setBookings(data.reservations || []);
    } catch (err) {
      console.log(err);
      setError("Load error.");
    }
  }

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (user.role !== "c") {
      setError("Only customers can view this page.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, navigate]);

  async function handleCancel(id) {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/eventReservations/${id}/cancel`, {
        method: "PATCH",
        headers: jsonAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage("Booking cancelled.");
        await load();
      } else {
        setMessage(data.message || "Cancel failed.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Cancel error.");
    }
  }

  return (
    <main className="news-page">
      <section className="news-hero">
        <h1>My event bookings</h1>
        <Link to="/restaurants">Browse restaurants</Link>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {!loading && bookings.length === 0 && <p>No event bookings yet.</p>}

      <section className="news-grid">
        {bookings.map((b) => (
          <article key={b.event_res_id} className="news-item">
            <h2>{b.title}</h2>
            <p>{b.restaurant_name}</p>
            <p>{new Date(b.start_datetime).toLocaleString()}</p>
            <p>Guests: {b.guest_count} · Status: {b.status}</p>
            {b.status === "pending" && (
              <button type="button" onClick={() => handleCancel(b.event_res_id)}>
                Cancel
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}