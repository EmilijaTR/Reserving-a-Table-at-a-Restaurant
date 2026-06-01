import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { API_URL } from "../config/api";
import RestaurantCard from "../components/RestaurantCard";
import RestaurantSearchBar, { todayForInput } from "../components/RestaurantSearchBar";

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const whereFilter = (searchParams.get("where") || "").trim().toLowerCase();
  const when = searchParams.get("when") || "";
  const guests = searchParams.get("guests") || "";

  const [where, setWhere] = useState(searchParams.get("where") || "");
  const [whenInput, setWhenInput] = useState(searchParams.get("when") || todayForInput());
  const [guestsInput, setGuestsInput] = useState(
    Number(searchParams.get("guests")) || 2
  );

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setWhere(searchParams.get("where") || "");
    setWhenInput(searchParams.get("when") || todayForInput());
    const g = searchParams.get("guests");
    setGuestsInput(g ? Number(g) || 2 : 2);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!whereFilter) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const address = (r.address || "").toLowerCase();
      return name.includes(whereFilter) || address.includes(whereFilter);
    });
  }, [restaurants, whereFilter]);

  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/restaurants`);
        const text = await res.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            setError("Invalid response from server.");
            return;
          }
        }

        if (!res.ok) {
          setError(data.message || `Error ${res.status}`);
          return;
        }

        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.log("Error loading restaurants:", err);
        setError("Could not load restaurants. Check API_URL and backend.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (where.trim()) params.set("where", where.trim());
    if (whenInput) params.set("when", whenInput);
    if (guestsInput) params.set("guests", String(guestsInput));
    setSearchParams(params);
  }

  return (
    <main>
      <h1 className="restaurants-page-title">Restaurants</h1>

      <div className="restaurants-search-wrap">
        <RestaurantSearchBar
          className="home-search--page"
          where={where}
          when={whenInput}
          guests={guestsInput}
          onWhereChange={setWhere}
          onWhenChange={setWhenInput}
          onGuestsChange={setGuestsInput}
          onSubmit={handleSearch}
        />
      </div>

      {(whereFilter || when || guests) && (
        <p className="text-muted restaurants-search-summary">
          {whereFilter && (
            <>
              Showing matches for <strong>{searchParams.get("where")}</strong>
            </>
          )}
          {when && (
            <>
              {whereFilter ? " · " : ""}
              Date: <strong>{when}</strong>
            </>
          )}
          {guests && (
            <>
              {" · "}
              Guests: <strong>{guests}</strong>
            </>
          )}
        </p>
      )}

      {loading && <p className="text-muted">Loading restaurants…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p className="text-muted">No restaurants yet.</p>
      )}

      {!loading && !error && restaurants.length > 0 && filtered.length === 0 && (
        <p className="text-muted">No restaurants match your search.</p>
      )}

      <section className="card-grid">
        {filtered.map((r) => (
          <RestaurantCard key={r.restaurant_id} restaurant={r} />
        ))}
      </section>
    </main>
  );
}
