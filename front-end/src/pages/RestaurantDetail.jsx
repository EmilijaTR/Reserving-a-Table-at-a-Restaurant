import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser, jsonAuthHeaders } from "../config/auth";
import {
  isValidCustomerBookingTime,
  minDatetimeLocalTwoHoursAhead,
} from "../utils/bookingTime";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [restaurant, setRestaurant] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  //booking form
  const [datetime, setDatetime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [useDiscount, setUseDiscount] = useState(false);

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

        const resEv = await fetch(`${API_URL}/events/restaurant/${id}`);
        const dataEv = await resEv.json();
        if (resEv.ok) {
          const now = Date.now();
          const upcoming = (dataEv.events || [])
            .filter((ev) => new Date(ev.start_datetime).getTime() >= now)
            .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
          setEvents(upcoming);
        }

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

    if (!isValidCustomerBookingTime(datetime)) {
      setMessage("Please choose a time at least 2 hours from now.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: Number(id),
          datetime: new Date(datetime).toISOString(),
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
    <main>
      <Link to="/restaurants">← Back to restaurants</Link>

      <section className="card detail-hero" style={{ marginTop: "16px" }}>
        {restaurant.picture && (
          <img
            className="detail-hero-image"
            src={`${API_URL}${restaurant.picture}`}
            alt={restaurant.name}
          />
        )}
        <div className="detail-hero-body">
          <h1>{restaurant.name}</h1>
          {restaurant.menu && (
            <p>
              <a href={`${API_URL}${restaurant.menu}`} target="_blank" rel="noreferrer">
                View menu (PDF)
              </a>
            </p>
          )}
          <div className="detail-meta">
            <p>{restaurant.address}</p>
            <p><strong>Phone:</strong> {restaurant.phone}</p>
            <p><strong>Email:</strong> {restaurant.email}</p>
            <p><strong>Hours:</strong> {restaurant.operating_hours}</p>
            <p><strong>Max capacity:</strong> {restaurant.guest_capacity} guests</p>
          </div>
        </div>
      </section>

      <section className="detail-events">
        <h2>Events at this restaurant</h2>
        {events.length === 0 && (
          <p className="text-muted">No upcoming events scheduled.</p>
        )}
        {events.length > 0 && (
          <div className="home-scroll">
            {events.map((ev) => (
              <Link
                key={ev.event_id}
                to={`/events/${ev.event_id}`}
                className="home-tile"
              >
                <div className="home-tile-image home-tile-image--event">
                  <span className="home-tile-date">
                    {new Date(ev.start_datetime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="home-tile-body">
                  <h3>{ev.title}</h3>
                  <p>
                    {new Date(ev.start_datetime).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <span className="home-tile-meta">
                    {ev.price != null && `${ev.price} € · `}
                    Up to {ev.guest_capacity} guests
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {message && <p className="alert alert-success">{message}</p>}

    

      <section className="page-section">
        <h2>Book a table</h2>
        {!user && <p><Link to="/login">Login</Link> as a customer to book.</p>}
        {user && user.role === "c" && (
          <form onSubmit={handleBook}>
            <div className="form-field">
              <label>Date and time</label>
              <input
                type="datetime-local"
                value={datetime}
                min={minDatetimeLocalTwoHoursAhead()}
                onChange={(e) => setDatetime(e.target.value)}
                required
              />
              <p className="form-hint">
                Earliest booking is 2 hours from now.
              </p>
            </div>
            <div className="form-field">
              <label>Number of guests</label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
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

      <section className="page-section">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
        {reviews.map((rev) => (
          <article key={rev.review_id} className="review-item">
            <p><strong>{rev.reviewer_name || "Customer"}</strong> — {rev.rating}/5</p>
            <p>{rev.comment}</p>
          </article>
        ))}
      </section>
    </main>
  );
}