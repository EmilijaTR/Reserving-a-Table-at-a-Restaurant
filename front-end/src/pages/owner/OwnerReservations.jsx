import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export default function OwnerReservations() {
  const { id: restaurantId } = useParams();

  const [restaurantName, setRestaurantName] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [datetime, setDatetime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");

  async function loadReservations() {
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/reservations/restaurant/${restaurantId}`,
        { headers: jsonAuthHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load reservations.");
        return;
      }
      setReservations(data.reservations || []);
    } catch (err) {
      console.log(err);
      setError("Load error.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const resMine = await fetch(`${API_URL}/restaurants/mine`, {
          headers: jsonAuthHeaders(),
        });
        const dataMine = await resMine.json();
        if (resMine.ok) {
          const r = (dataMine.restaurants || []).find(
            (x) => String(x.restaurant_id) === String(restaurantId)
          );
          if (!cancelled && r) setRestaurantName(r.name);
        }
        await loadReservations();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function patchAction(reservationId, action) {
    setMessage("");
    const path =
      action === "complete"
        ? `${API_URL}/reservations/${reservationId}/complete`
        : `${API_URL}/reservations/${reservationId}/no-show`;

    try {
      const res = await fetch(path, {
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
        setMessage(data.message || "Updated.");
        await loadReservations();
      } else {
        setMessage(data.message || "Action failed.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Request error.");
    }
  }

  async function handleWalkIn(event) {
    event.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: Number(restaurantId),
          datetime: new Date(datetime).toISOString(),
          guest_count: Number(guestCount),
          notes,
        }),
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: "Invalid response." };
        }
      }
      if (res.ok && data.ok) {
        setMessage("Walk-in reservation added.");
        setDatetime("");
        setNotes("");
        await loadReservations();
      } else {
        setMessage(data.message || "Could not add reservation.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Add error.");
    }
  }

  return (
    <main className="news-page">
      <Link to="/owner/restaurants">← My restaurants</Link>

      <section className="news-hero">
        <h1>Reservations — {restaurantName || `Restaurant #${restaurantId}`}</h1>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <section className="news-item">
        <h2>Add walk-in</h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Put guest name / phone in notes.
        </p>
        <form onSubmit={handleWalkIn}>
          <div>
            <label>Date and time</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Guests</label>
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Notes (guest contact)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button type="submit">Add reservation</button>
        </form>
      </section>

      {!loading && (
        <section className="news-grid">
          {reservations.length === 0 && <p>No reservations.</p>}
          {reservations.map((r) => (
            <article key={r.reservation_id} className="news-item">
              <p>
                <strong>
                  {r.maker_role === "o" ? "Walk-in" : r.customer_name || "Customer"}
                </strong>
              </p>
              <p>{formatDateTime(r.datetime)} · {r.guest_count} guests</p>
              <p>Status: <strong>{r.status}</strong></p>
              {r.discount_used === 1 && <p>% Discount used</p>}
              {r.notes && <p>Notes: {r.notes}</p>}

              {r.status === "pending" && (
                <p>
                  <button type="button" onClick={() => patchAction(r.reservation_id, "complete")}>
                    Complete
                  </button>
                  {" "}
                  <button type="button" onClick={() => patchAction(r.reservation_id, "no-show")}>
                    No-show
                  </button>
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}