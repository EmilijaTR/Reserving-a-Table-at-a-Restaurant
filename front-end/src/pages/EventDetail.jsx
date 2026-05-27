import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser, jsonAuthHeaders } from "../config/auth";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.message || "Event not found.");
          return;
        }
        if (!cancelled) {
          setEvent(data.event);
          setSeats(data.seats);
        }
      } catch (err) {
        console.log(err);
        if (!cancelled) setError("Load error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleBook(e) {
    e.preventDefault();
    setMessage("");

    if (!user || user.role !== "c") {
      setMessage("Please log in as a customer to book.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/reservations`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ guest_count: Number(guestCount) }),
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          setMessage("Invalid server response.");
          return;
        }
      }

      if (res.ok && data.ok) {
        setMessage("Seats booked! See My event bookings.");
        const res2 = await fetch(`${API_URL}/events/${eventId}`);
        const data2 = await res2.json();
        if (res2.ok) {
          setEvent(data2.event);
          setSeats(data2.seats);
        }
      } else {
        setMessage(data.message || "Booking failed.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Booking error.");
    }
  }

  if (loading) return <main><p>Loading...</p></main>;
  if (error || !event) return <main><p>{error || "Not found"}</p></main>;

  return (
    <main className="news-page">
      <Link to={`/restaurants/${event.restaurant_id}/events`}>← Events</Link>

      <section className="news-hero">
        <h1>{event.title}</h1>
        <p>{new Date(event.start_datetime).toLocaleString()}</p>
        <p>Duration: {event.duration} h · Price per guest: {event.price}</p>
        <p>{event.description}</p>
        {seats && (
          <p>
            <strong>Seats left:</strong> {seats.remaining_guests} / {seats.guest_capacity}
          </p>
        )}
      </section>

      {message && <p>{message}</p>}

      {user && user.role === "c" && seats && seats.remaining_guests > 0 && (
        <section className="news-item">
          <h2>Book seats</h2>
          <form onSubmit={handleBook}>
            <div>
              <label>Number of guests</label>
              <input
                type="number"
                min="1"
                max={seats.remaining_guests}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>
            <button type="submit">Book</button>
          </form>
        </section>
      )}
    </main>
  );
}