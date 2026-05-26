import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser, jsonAuthHeaders } from "../config/auth";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  //booking form
  const [datetime, setDatetime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [useDiscount, setUseDiscount] = useState(false);

  //review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const resRest = await fetch(`${API_URL}/restaurants`);
        const dataRest = await resRest.json();
        if (!resRest.ok) {
          setError(dataRest.message || "Failed to load restaurant.");
          return;
        }
        const found = (dataRest.restaurants || []).find(
          (r) => String(r.restaurant_id) === String(id)
        );
        if (!found) {
          setError("Restaurant not found.");
          return;
        }
        setRestaurant(found);

        const resRev = await fetch(`${API_URL}/reviews/restaurant/${id}`);
        const dataRev = await resRev.json();
        if (resRev.ok) {
          setReviews(dataRev.reviews || []);
        }
      } catch (err) {
        console.log(err);
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleBook(event) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please log in as a customer to book.");
      navigate("/login");
      return;
    }
    if (user.role !== "c") {
      setMessage("Only customers can book online. Owners use the owner panel.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: Number(id),
          datetime,
          guest_count: Number(guestCount),
          notes,
          use_discount: useDiscount,
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
        setMessage("Reservation created! See My reservations.");
        setDatetime("");
        setNotes("");
        setUseDiscount(false);
      } else {
        setMessage(data.message || `Booking failed (${res.status}).`);
      }
    } catch (err) {
      console.log(err);
      setMessage("Booking error.");
    }
  }

  async function handleReview(event) {
    event.preventDefault();
    setMessage("");

    if (!user || user.role !== "c") {
      setMessage("Only logged-in customers can leave a review.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: Number(id),
          rating: Number(rating),
          comment,
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
        setMessage("Review submitted.");
        const resRev = await fetch(`${API_URL}/reviews/restaurant/${id}`);
        const dataRev = await resRev.json();
        if (resRev.ok) setReviews(dataRev.reviews || []);
        setComment("");
      } else {
        setMessage(data.message || `Review failed (${res.status}).`);
      }
    } catch (err) {
      console.log(err);
      setMessage("Review error.");
    }
  }

  if (loading) return <main><p>Loading...</p></main>;
  if (error) {
    return (
      <main>
        <Link to="/restaurants">← Back</Link>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="news-page">
      <Link to="/restaurants">← Back to restaurants</Link>

      <section className="news-hero">
        <h1>{restaurant.name}</h1>
        <p>{restaurant.address}</p>
        <p><strong>Phone:</strong> {restaurant.phone}</p>
        <p><strong>Email:</strong> {restaurant.email}</p>
        <p><strong>Hours:</strong> {restaurant.operating_hours}</p>
        <p><strong>Max capacity:</strong> {restaurant.guest_capacity} guests</p>
      </section>

      {message && <p>{message}</p>}

      <section className="news-item">
        <h2>Book a table</h2>
        {!user && <p><Link to="/login">Login</Link> as a customer to book.</p>}
        {user && user.role === "c" && (
          <form onSubmit={handleBook}>
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
              <label>Number of guests</label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Notes (optional)</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={useDiscount}
                  onChange={(e) => setUseDiscount(e.target.checked)}
                />
                Use loyalty discount (5 points, 5% off)
              </label>
            </div>
            <button type="submit">Book</button>
          </form>
        )}
      </section>

      <section className="news-item">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((rev) => (
          <article key={rev.review_id} style={{ marginBottom: "16px" }}>
            <p><strong>{rev.reviewer_name || "Customer"}</strong> — {rev.rating}/5</p>
            <p>{rev.comment}</p>
          </article>
        ))}
      </section>

      {user && user.role === "c" && (
        <section className="news-item">
          <h2>Write a review</h2>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            You need at least one completed reservation at this restaurant.
          </p>
          <form onSubmit={handleReview}>
            <div>
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
            <div>
              <label>Comment</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button type="submit">Submit review</button>
          </form>
        </section>
      )}
    </main>
  );
}