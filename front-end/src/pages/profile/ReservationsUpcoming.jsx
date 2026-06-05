import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import ReservationRow from "../../components/ReservationRow";
import { splitTableReservations } from "../../utils/reservationFilters";

export default function ReservationsUpcoming() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReservations = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/reservations/mine`, {
        headers: jsonAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load.");
        return;
      }
      setReservations(data.reservations || []);
    } catch (err) {
      console.log(err);
      setError("Could not load reservations.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadReservations();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadReservations]);

  const { upcoming } = useMemo(
    () => splitTableReservations(reservations),
    [reservations]
  );

  async function handleUpdated() {
    setMessage("Reservation updated.");
    await loadReservations();
  }

  async function handleCancel(reservationId) {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: "PATCH",
        headers: jsonAuthHeaders(),
      });
      const data = await res.json();
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

  return (
    <>
      <h1 className="profile-page-title">Upcoming reservations</h1>
      <p className="text-muted profile-page-lead">
        Pending table bookings. Edit date, guests, or notes — or cancel in time if
        your plans change.
      </p>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      {!loading && !error && upcoming.length === 0 && (
        <p className="text-muted">
          No upcoming reservations.{" "}
          <Link to="/restaurants">Find a restaurant</Link>
        </p>
      )}

      <div className="reservation-list">
        {upcoming.map((r) => (
          <ReservationRow
            key={r.reservation_id}
            reservation={r}
            showEdit
            showCancel
            onCancel={handleCancel}
            onUpdated={handleUpdated}
          />
        ))}
      </div>
    </>
  );
}
