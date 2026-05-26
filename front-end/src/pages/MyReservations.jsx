import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser, jsonAuthHeaders } from "../config/auth";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export default function MyReservations() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userId = user?.user_id;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReservations() {
    setError("");
    try {
      const res = await fetch(`${API_URL}/reservations/mine`, {
        headers: jsonAuthHeaders(),
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          setError("Invalid response.");
          return;
        }
      }
      if (!res.ok) {
        setError(data.message || `Error ${res.status}`);
        return;
      }
      setReservations(data.reservations || []);
    } catch (err) {
      console.log(err);
      setError("Could not load reservations.");
    }
  }

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (user.role !== "c") {
      setError("Only customers have personal reservations here.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      setLoading(true);
      await loadReservations();
      if (!cancelled) setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [userId, navigate]); // NOT [user, navigate]

  async function handleCancel(reservationId) {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: "PATCH",
        headers: jsonAuthHeaders(),
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }
      if (res.ok && data.ok) {
        setMessage("Reservation cancelled.");
        await loadReservations();
      } else {
        setMessage(data.message || "Cancel failed.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Cancel error.");
    }
  }

  if (!userId) {
    return <main><p>Redirecting to login...</p></main>;
  }

  return (
    <main className="news-page">
      <section className="news-hero">
        <h1>My reservations</h1>
        <Link to="/restaurants">Browse restaurants</Link>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p>You have no reservations yet.</p>
      )}

      {!loading && (
        <section className="news-grid">
          {reservations.map((r) => (
            <article key={r.reservation_id} className="news-item">
              <h2>{r.restaurant_name}</h2>
              <p><strong>When:</strong> {formatDateTime(r.datetime)}</p>
              <p><strong>Guests:</strong> {r.guest_count}</p>
              <p><strong>Status:</strong> {r.status}</p>
              {r.discount_used === 1 && <p>Discount used</p>}
              {r.notes && <p><strong>Notes:</strong> {r.notes}</p>}

              {r.status === "pending" && (
                <button type="button" onClick={() => handleCancel(r.reservation_id)}>
                  Cancel
                </button>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}