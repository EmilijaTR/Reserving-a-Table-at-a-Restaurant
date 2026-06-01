import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import EventBookingRow from "../../components/EventBookingRow";
import { splitEventBookings } from "../../utils/reservationFilters";

export default function EventsPast() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const { past } = useMemo(() => splitEventBookings(bookings), [bookings]);

  return (
    <>
      <h1 className="profile-page-title">Past event bookings</h1>
      <p className="text-muted profile-page-lead">
        Completed and cancelled event reservations.
      </p>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && past.length === 0 && (
        <p className="text-muted">No past event bookings yet.</p>
      )}

      <div className="reservation-list">
        {past.map((b) => (
          <EventBookingRow key={b.event_res_id} booking={b} />
        ))}
      </div>
    </>
  );
}
