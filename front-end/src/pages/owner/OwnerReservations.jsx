import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import { getGridBoundsFromOperatingHours } from "../../config/operatingHours";

/** Same idea as backend: each reservation blocks 2 hours from start */
const DURATION_MS = 2 * 60 * 60 * 1000;
const SLOT_MS = 30 * 60 * 1000;


function pad(n) {
  return String(n).padStart(2, "0");
}

function toYMD(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseYMD(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function formatSlotLabel(date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function slotKeyForReservation(reservation, openSlotIndex, closeSlotIndex) {
  const t = new Date(reservation.datetime);
  const minutesFromMidnight = t.getHours() * 60 + t.getMinutes();
  const slotIndex = Math.floor(minutesFromMidnight / 30);
  const endIndex = closeSlotIndex - 1;
  return Math.min(Math.max(slotIndex, openSlotIndex), endIndex);
}

function buildSlots(dayStart, openSlotIndex, closeSlotIndex) {
  const slots = [];
  for (let i = openSlotIndex; i < closeSlotIndex; i++) {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    const start = new Date(dayStart);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + SLOT_MS);
    slots.push({
      index: i,
      start,
      end,
      label: `${formatSlotLabel(start)} – ${formatSlotLabel(end)}`,
    });
  }
  return slots;
}

function reservationsForDay(list, ymd) {
  return list.filter((r) => {
    const t = new Date(r.datetime);
    return toYMD(t) === ymd;
  });
}

/** Max overlapping guest_count in any 30-minute slice (pending only), 2h blocks from each res */
function maxOverlapGuestsOnDay(dayReservations, openSlotIndex, closeSlotIndex) {
  const pending = dayReservations.filter((r) => r.status === "pending");
  if (pending.length === 0) return 0;

  const day = parseYMD(toYMD(new Date(pending[0].datetime)));
  let max = 0;

  for (let i = openSlotIndex; i < closeSlotIndex; i++) {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    const slotStart = new Date(day);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + SLOT_MS);

    let sum = 0;
    for (const r of pending) {
      const T = new Date(r.datetime).getTime();
      const REnd = T + DURATION_MS;
      if (T < slotEnd.getTime() && REnd > slotStart.getTime()) {
        sum += Number(r.guest_count || 0);
      }
    }
    if (sum > max) max = sum;
  }
  return max;
}

function displayName(r) {
  if (r.customer_name) return r.customer_name;
  if (r.maker_name && r.maker_role === "o") {
    if (r.notes && String(r.notes).trim()) return String(r.notes).trim().split("\n")[0];
    return "Walk-in";
  }
  return r.maker_name || "Guest";
}

export default function OwnerReservations() {
  const { id: restaurantId } = useParams();

  const [restaurantName, setRestaurantName] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gridBounds, setGridBounds] = useState(getGridBoundsFromOperatingHours("09:00-22:00"));
  const [hoursWarning, setHoursWarning] = useState("");

  const [selectedDate, setSelectedDate] = useState(() => toYMD(new Date()));

  const [datetime, setDatetime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");

  async function loadReservations() {
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/reservations/restaurant/${restaurantId}`,
        { headers: jsonAuthHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load reservations.");
        return;
      }
      setReservations(data.reservations || []);
    } catch (err) {
      console.log(err);
      setError("Load error.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const resMine = await fetch(`${API_URL}/restaurants/mine`, {
          headers: jsonAuthHeaders(),
        });
        const dataMine = await resMine.json();
        if (resMine.ok) {
          const r = (dataMine.restaurants || []).find(
            (x) => String(x.restaurant_id) === String(restaurantId)
          );
            if (!cancelled && r) {
            setRestaurantName(r.name);
            setCapacity(Number(r.guest_capacity) || 0);
            const bounds = getGridBoundsFromOperatingHours(r.operating_hours);
            setGridBounds(bounds);
            if (bounds.fromFallback) {
              setHoursWarning(
                "Operating hours are not in HH:MM-HH:MM format; showing default 09:00-22:00. Edit restaurant profile to fix."
              );
            } else {
              setHoursWarning("");
            }
          }
        }
        await loadReservations();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const dayStart = useMemo(() => parseYMD(selectedDate), [selectedDate]);
   const slots = useMemo(
    () => buildSlots(dayStart, gridBounds.openSlotIndex, gridBounds.closeSlotIndex),
    [dayStart, gridBounds]
  );

  const dayReservations = useMemo(
    () => reservationsForDay(reservations, selectedDate),
    [reservations, selectedDate]
  );

  const pendingDay = useMemo(
    () => dayReservations.filter((r) => r.status === "pending"),
    [dayReservations]
  );

  const maxOverlap = useMemo(
    () =>
      maxOverlapGuestsOnDay(
        dayReservations,
        gridBounds.openSlotIndex,
        gridBounds.closeSlotIndex
      ),
    [dayReservations, gridBounds]
  );
  const availableSeats = Math.max(0, capacity - maxOverlap);

  const bySlot = useMemo(() => {
    const map = {};
    for (const s of slots) {
      map[s.index] = [];
    }
    for (const r of pendingDay) {
      const idx = slotKeyForReservation(
        r,
        gridBounds.openSlotIndex,
        gridBounds.closeSlotIndex
      );
      if (!map[idx]) map[idx] = [];
      map[idx].push(r);
    }
    return map;
  }, [pendingDay, slots, gridBounds]);

  async function patchAction(reservationId, action) {
    setMessage("");
    const path =
      action === "complete"
        ? `${API_URL}/reservations/${reservationId}/complete`
        : `${API_URL}/reservations/${reservationId}/no-show`;

    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: jsonAuthHeaders(),
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }
      if (res.ok && data.ok) {
        setMessage(data.message || "Updated.");
        await loadReservations();
      } else {
        setMessage(data.message || "Action failed.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Request error.");
    }
  }

  async function handleWalkIn(event) {
    event.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          restaurant_id: Number(restaurantId),
          datetime: new Date(datetime).toISOString(),
          guest_count: Number(guestCount),
          notes,
        }),
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
        setMessage("Walk-in reservation added.");
        setDatetime("");
        setNotes("");
        await loadReservations();
      } else {
        setMessage(data.message || "Could not add reservation.");
      }
    } catch (err) {
      console.log(err);
      setMessage("Add error.");
    }
  }

  const now = new Date();
    const activeSlotIndex =
    toYMD(now) === selectedDate
      ? slotKeyForReservation(
          { datetime: now.toISOString() },
          gridBounds.openSlotIndex,
          gridBounds.closeSlotIndex
        )
      : null;

  return (
    <main className="news-page res-board page-wide">
      <Link to="/owner/restaurants">← My restaurants</Link>

      <header className="page-header" style={{ marginTop: "16px" }}>
        <h1>Reservations — {restaurantName || `Restaurant #${restaurantId}`}</h1>
        {gridBounds.normalized && !hoursWarning && (
          <p>Hours: {gridBounds.normalized} (same every day)</p>
        )}
      </header>

      {hoursWarning && <p className="alert alert-warning">{hoursWarning}</p>}

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <div className="res-board-toolbar">
        <label>
          <strong>Date</strong>{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <span className="res-board-badge">Available seats: {availableSeats}</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const d = parseYMD(selectedDate);
            d.setHours(12, 0, 0, 0);
            const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
            setDatetime(local);
            document.getElementById("walkin-form")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Add reservation +
        </button>
      </div>

      {!loading && (
        <div className="res-board-scroll">
          <div className="res-board-grid">
            {slots.map((s) => (
              <div key={s.index}>
                <div
                  className={
                    "res-board-slot-header" +
                    (s.index === activeSlotIndex ? " res-board-slot-header--active" : "")
                  }
                >
                  {s.label}
                </div>
                <div className="res-board-slot-body">
                  {(bySlot[s.index] || []).map((r) => (
                    <div key={r.reservation_id} className="res-card">
                      {(r.discount_used === 1 || r.discount_used === true) && (
                        <span className="res-card-discount">%</span>
                      )}
                      <div className="res-card-name">{displayName(r)}</div>
                      <div className="res-card-people">People: {r.guest_count}</div>
                      <div style={{ marginTop: "6px", fontSize: "0.75rem" }}>
                        {new Date(r.datetime).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {r.status}
                      </div>
                      {r.status === "pending" && (
                        <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                          <button type="button" onClick={() => patchAction(r.reservation_id, "complete")}>
                            Complete
                          </button>
                          <button type="button" onClick={() => patchAction(r.reservation_id, "no-show")}>
                            No-show
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="res-legend">% = discount used</p>

      <section className="page-section" id="walkin-form">
        <h2>Add walk-in</h2>
        <p className="text-muted">Put guest name / phone in notes.</p>
        <form onSubmit={handleWalkIn}>
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
            <label>Guests</label>
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Notes (guest contact)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button type="submit">Add reservation</button>
        </form>
      </section>

      <section className="page-section">
        <h2>All reservations (any day)</h2>
        <p className="text-muted">
          Scroll for full history. Grid above shows only <strong>pending</strong> for the selected day.
        </p>
        <ul style={{ paddingLeft: "18px" }}>
          {reservations.map((r) => (
            <li key={r.reservation_id} style={{ marginBottom: "8px" }}>
              <strong>{displayName(r)}</strong> — {new Date(r.datetime).toLocaleString()} —{" "}
              {r.guest_count} guests — {r.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}