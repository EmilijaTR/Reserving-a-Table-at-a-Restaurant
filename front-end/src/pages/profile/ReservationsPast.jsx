import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import ReservationRow from "../../components/ReservationRow";
import { splitTableReservations } from "../../utils/reservationFilters";

export default function ReservationsPast() {
  const [reservations, setReservations] = useState([]);
  const [reviewedRestaurantIds, setReviewedRestaurantIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [resRes, revRes] = await Promise.all([
        fetch(`${API_URL}/reservations/mine`, { headers: jsonAuthHeaders() }),
        fetch(`${API_URL}/reviews/mine`, { headers: jsonAuthHeaders() }),
      ]);
      const dataRes = await resRes.json();
      const dataRev = await revRes.json();

      if (!resRes.ok) {
        setError(dataRes.message || "Failed to load reservations.");
        return;
      }
      setReservations(dataRes.reservations || []);

      if (revRes.ok) {
        const ids = new Set(
          (dataRev.reviews || []).map((rev) => Number(rev.restaurant_id))
        );
        setReviewedRestaurantIds(ids);
      }
    } catch (err) {
      console.log(err);
      setError("Could not load data.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadAll();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  const { past } = useMemo(
    () => splitTableReservations(reservations),
    [reservations]
  );

  return (
    <>
      <h1 className="profile-page-title">Past reservations</h1>
      <p className="text-muted profile-page-lead">
        Completed, cancelled, and no-show visits. Completed visits can be reviewed
        once per restaurant.
      </p>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && past.length === 0 && (
        <p className="text-muted">No past reservations yet.</p>
      )}

      <div className="reservation-list">
        {past.map((r) => (
          <ReservationRow
            key={r.reservation_id}
            reservation={r}
            showReview={r.status === "completed"}
            alreadyReviewed={reviewedRestaurantIds.has(Number(r.restaurant_id))}
            onReviewSubmitted={loadAll}
          />
        ))}
      </div>

      {!loading && past.some((r) => r.status === "cancelled") && (
        <p className="text-muted" style={{ marginTop: "16px", fontSize: "0.9rem" }}>
          Cancelled reservations do not earn loyalty points.
        </p>
      )}
    </>
  );
}
