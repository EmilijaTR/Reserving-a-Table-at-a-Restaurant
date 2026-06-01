import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import EventBookingRow from "../../components/EventBookingRow";
import { splitEventBookings } from "../../utils/reservationFilters";

export default function EventsUpcoming() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const { upcoming } = useMemo(() => splitEventBookings(bookings), [bookings]);

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
    <>
      <h1 className="profile-page-title">Upcoming event bookings</h1>
      <p className="text-muted profile-page-lead">
        Events you are signed up for.
      </p>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      {!loading && !error && upcoming.length === 0 && (
        <p className="text-muted">
          No upcoming event bookings. <Link to="/events">Browse events</Link>
        </p>
      )}

      <div className="reservation-list">
        {upcoming.map((b) => (
          <EventBookingRow
            key={b.event_res_id}
            booking={b}
            showCancel
            onCancel={handleCancel}
          />
        ))}
      </div>
    </>
  );
}
