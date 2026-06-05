import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config/api";
import { jsonAuthHeaders } from "../config/auth";
import { formatDateTime, statusLabel } from "../utils/reservationFilters";
import {
  isoToDatetimeLocalValue,
  isValidCustomerBookingTime,
  minDatetimeLocalTwoHoursAhead,
} from "../utils/bookingTime";
import ReviewForm from "./ReviewForm";

export default function ReservationRow({
  reservation,
  showCancel,
  showEdit,
  showReview,
  existingReview,
  onCancel,
  onReviewSubmitted,
  onUpdated,
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDatetime, setEditDatetime] = useState("");
  const [editGuests, setEditGuests] = useState(2);
  const [editNotes, setEditNotes] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editIsError, setEditIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const alreadyReviewed = Boolean(existingReview);

  function openEdit() {
    setEditOpen(true);
    setReviewOpen(false);
    setEditDatetime(isoToDatetimeLocalValue(reservation.datetime));
    setEditGuests(reservation.guest_count);
    setEditNotes(reservation.notes || "");
    setEditMessage("");
    setEditIsError(false);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    setEditMessage("");
    setEditIsError(false);

    if (!isValidCustomerBookingTime(editDatetime)) {
      setEditMessage("Choose a time at least 2 hours from now.");
      setEditIsError(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reservations/${reservation.reservation_id}`, {
        method: "PATCH",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          datetime: new Date(editDatetime).toISOString(),
          guest_count: Number(editGuests),
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEditOpen(false);
        onUpdated?.();
      } else {
        setEditMessage(data.message || "Could not update reservation.");
        setEditIsError(true);
      }
    } catch (err) {
      console.log(err);
      setEditMessage("Update error.");
      setEditIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="reservation-row">
      <div className="reservation-row-main">
        <div className="reservation-row-info">
          <h3>{reservation.restaurant_name}</h3>
          <p className="reservation-row-meta">
            <span>Guests: {reservation.guest_count}</span>
            <span>{formatDateTime(reservation.datetime)}</span>
            <span
              className={`status-badge status-badge--${
                reservation.status === "no-show" ? "noshow" : reservation.status
              }`}
            >
              {statusLabel(reservation.status)}
            </span>
          </p>
        </div>
        <div className="reservation-row-actions">
          <Link
            to={`/restaurants/${reservation.restaurant_id}`}
            className="btn btn-ghost btn-sm"
          >
            Details
          </Link>
          {showEdit && reservation.status === "pending" && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => (editOpen ? setEditOpen(false) : openEdit())}
            >
              {editOpen ? "Close" : "Edit"}
            </button>
          )}
          {showCancel && reservation.status === "pending" && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onCancel(reservation.reservation_id)}
            >
              Cancel
            </button>
          )}
          {showReview && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditOpen(false);
                setReviewOpen((v) => !v);
              }}
            >
              {reviewOpen ? "Close" : alreadyReviewed ? "Edit review" : "Review"}
            </button>
          )}
        </div>
      </div>

      {editOpen && (
        <form className="review-inline" onSubmit={handleEditSubmit}>
          <div className="form-field">
            <label>Date and time</label>
            <input
              type="datetime-local"
              value={editDatetime}
              min={minDatetimeLocalTwoHoursAhead()}
              onChange={(e) => setEditDatetime(e.target.value)}
              required
            />
            <p className="form-hint">Must be at least 2 hours from now.</p>
          </div>
          <div className="form-field">
            <label>Guests</label>
            <input
              type="number"
              min="1"
              value={editGuests}
              onChange={(e) => setEditGuests(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea
              rows="2"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
          {editMessage && (
            <p className={editIsError ? "alert alert-error" : "alert alert-success"}>
              {editMessage}
            </p>
          )}
        </form>
      )}

      {reviewOpen && (
        <ReviewForm
          compact
          reviewId={existingReview?.review_id}
          restaurantId={reservation.restaurant_id}
          initialRating={existingReview?.rating ?? 5}
          initialComment={existingReview?.comment ?? ""}
          onSuccess={() => {
            setReviewOpen(false);
            onReviewSubmitted?.();
          }}
        />
      )}
    </article>
  );
}
