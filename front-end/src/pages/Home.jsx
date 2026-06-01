import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { getStoredUser } from "../config/auth";
import RestaurantSearchBar, { todayForInput } from "../components/RestaurantSearchBar";

const PREVIEW_COUNT = 8;

async function fetchUpcomingEvents(restaurants) {
  const now = Date.now();
  const slices = restaurants.slice(0, 12);
  const results = await Promise.all(
    slices.map(async (r) => {
      try {
        const res = await fetch(`${API_URL}/events/restaurant/${r.restaurant_id}`);
        const data = await res.json();
        if (!res.ok) return [];
        return (data.events || []).map((ev) => ({
          ...ev,
          restaurant_id: r.restaurant_id,
          restaurant_name: r.name,
        }));
      } catch {
        return [];
      }
    })
  );

  return results
    .flat()
    .filter((ev) => new Date(ev.start_datetime).getTime() >= now)
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
}

export default function Home() {
  const navigate = useNavigate();
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState(todayForInput());
  const [guests, setGuests] = useState(2);

  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/restaurants`);
        const data = await res.json();
        if (!res.ok || cancelled) return;

        const list = data.restaurants || [];
        if (!cancelled) setRestaurants(list);

        const upcoming = await fetchUpcomingEvents(list);
        if (!cancelled) setEvents(upcoming.slice(0, PREVIEW_COUNT));
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (where.trim()) params.set("where", where.trim());
    if (when) params.set("when", when);
    if (guests) params.set("guests", String(guests));
    const q = params.toString();
    navigate(q ? `/restaurants?${q}` : "/restaurants");
  }

  const restaurantPreview = restaurants.slice(0, PREVIEW_COUNT);
  const user = getStoredUser();

  return (
    <main className="home-page">
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-inner">
          <p className="landing-eyebrow">RESTABLE</p>
          <h1>Find your next table</h1>
          <p className="landing-tagline">
            Search restaurants, pick a date, and book in minutes — or join a special event.
          </p>

          <RestaurantSearchBar
            where={where}
            when={when}
            guests={guests}
            onWhereChange={setWhere}
            onWhenChange={setWhen}
            onGuestsChange={setGuests}
            onSubmit={handleSearch}
          />
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>Restaurants</h2>
          <Link to="/restaurants" className="home-see-all">
            See all →
          </Link>
        </div>

        {loading && <p className="text-muted">Loading…</p>}
        {!loading && restaurantPreview.length === 0 && (
          <p className="text-muted">No restaurants listed yet.</p>
        )}

        <div className="home-scroll">
          {restaurantPreview.map((r) => (
            <Link
              key={r.restaurant_id}
              to={`/restaurants/${r.restaurant_id}`}
              className="home-tile"
            >
              {r.picture ? (
                <img
                  className="home-tile-image"
                  src={`${API_URL}${r.picture}`}
                  alt=""
                />
              ) : (
                <div className="home-tile-image home-tile-image--placeholder">
                  {r.name.charAt(0)}
                </div>
              )}
              <div className="home-tile-body">
                <h3>{r.name}</h3>
                <p>{r.address}</p>
                <span className="home-tile-meta">
                  {r.operating_hours} · {r.guest_capacity} seats
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>Events</h2>
          <Link to="/events" className="home-see-all">
            See all →
          </Link>
        </div>

        {!loading && events.length === 0 && (
          <p className="text-muted">No upcoming events right now.</p>
        )}

        <div className="home-scroll">
          {events.map((ev) => (
            <Link key={ev.event_id} to={`/events/${ev.event_id}`} className="home-tile">
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
                <p>{ev.restaurant_name}</p>
                <span className="home-tile-meta">
                  {new Date(ev.start_datetime).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {ev.price != null && ` · ${ev.price} €`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-promo">
        <div className="home-promo-badge">5 points</div>
        <div>
          <h2>Loyalty discount</h2>
          <p>
            After <strong>five completed reservations</strong> (five loyalty points),
            you receive a <strong>5% discount</strong> on your bill at your next
            reservation.
          </p>
        </div>
      </section>

      {!user && (
        <section className="home-cta-band">
          <div className="home-cta-card">
            <h2>Are you a restaurant owner?</h2>
            <p>List your venue, manage tables, and host events.</p>
            <Link to="/register?role=o" className="btn btn-primary">
              Register your restaurant
            </Link>
          </div>
          <div className="home-cta-card home-cta-card--alt">
            <h2>Already a client?</h2>
            <p>Sign in to book, track points, and manage reservations.</p>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
