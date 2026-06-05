import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { jsonAuthHeaders } from "../config/auth";

export default function ReviewForm({
  reviewId,
  restaurantId,
  initialRating = 5,
  initialComment = "",
  onSuccess,
  submitLabel,
  compact = false,
}) {
  const isEdit = Boolean(reviewId);
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment || "");
  }, [initialRating, initialComment, reviewId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setSubmitting(true);

    try {
      const body = { rating: Number(rating), comment };
      const url = isEdit
        ? `${API_URL}/reviews/${reviewId}`
        : `${API_URL}/reviews`;
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit ? body : { ...body, restaurant_id: Number(restaurantId) };

      const res = await fetch(url, {
        method,
        headers: jsonAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setMessage(isEdit ? "Review updated." : "Review submitted. Thank you!");
        setIsError(false);
        onSuccess?.(data);
      } else {
        setMessage(data.message || "Could not save review.");
        setIsError(true);
      }
    } catch (err) {
      console.log(err);
      setMessage("Review error.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const btnClass = compact ? "btn btn-primary btn-sm" : "btn btn-primary";

  return (
    <form className="review-inline" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Rating (1–5)</label>
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
        <label>{isEdit ? "Your review" : "Comment"}</label>
        <textarea
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your visit?"
        />
      </div>
      <button type="submit" className={btnClass} disabled={submitting}>
        {submitting
          ? "Saving…"
          : submitLabel || (isEdit ? "Save review" : "Submit review")}
      </button>
      {message && (
        <p className={isError ? "alert alert-error" : "text-muted"}>{message}</p>
      )}
    </form>
  );
}
