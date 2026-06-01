import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config/api";
import { jsonAuthHeaders } from "../config/auth";
import { formatDateTime, statusLabel } from "../utils/reservationFilters";

export default function ReservationRow({
  reservation,
  showCancel,
  showReview,
  alreadyReviewed,
  onCancel,
  onReviewSubmitted,
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewMessage("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: reservation.restaurant_id,
          rating: Number(rating),
          comment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReviewMessage("Review submitted. Thank you!");
        setReviewOpen(false);
        onReviewSubmitted?.();
      } else {
        setReviewMessage(data.message || "Could not submit review.");
      }
    } catch (err) {
      console.log(err);
      setReviewMessage("Review error.");
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
          {showCancel && reservation.status === "pending" && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onCancel(reservation.reservation_id)}
            >
              Cancel
            </button>
          )}
          {showReview && !alreadyReviewed && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setReviewOpen((v) => !v)}
            >
              {reviewOpen ? "Close" : "Review"}
            </button>
          )}
          {showReview && alreadyReviewed && (
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
              Reviewed
            </span>
          )}
        </div>
      </div>

      {reviewOpen && (
        <form className="review-inline" onSubmit={handleReviewSubmit}>
          <div className="form-field">
            <label>Rate (1–5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Your review</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your visit?"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </button>
          {reviewMessage && <p className="text-muted">{reviewMessage}</p>}
        </form>
      )}
    </article>
  );
}
