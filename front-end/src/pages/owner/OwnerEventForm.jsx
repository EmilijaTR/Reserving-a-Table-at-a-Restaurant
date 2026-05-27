import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

const empty = {
  title: "",
  start_datetime: "",
  duration: "",
  description: "",
  guest_capacity: "",
  price: "",
};

export default function OwnerEventForm() {
  const { id: restaurantId, eventId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(eventId);

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Not found");
        const ev = data.event;
        const dt = new Date(ev.start_datetime);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        if (!cancelled) {
          setForm({
            title: ev.title || "",
            start_datetime: local,
            duration: String(ev.duration ?? ""),
            description: ev.description || "",
            guest_capacity: String(ev.guest_capacity ?? ""),
            price: String(ev.price ?? ""),
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {

      const body = {
        title: form.title,
        start_datetime: new Date(form.start_datetime).toISOString(),
        duration: Number(form.duration),
        description: form.description,
        guest_capacity: Number(form.guest_capacity),
        price: Number(form.price),
      };

      if (!isEdit) body.restaurant_id = Number(restaurantId);

      const url = isEdit
        ? `${API_URL}/events/${eventId}`
        : `${API_URL}/events`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: jsonAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage(isEdit ? "Event updated." : "Event created.");
        setTimeout(
          () => navigate(`/owner/restaurants/${restaurantId}/events`),
          1000
        );
      } else {
        setError(data.message || `Failed (${res.status})`);
      }
    } catch (err) {
      console.log(err);
      setError(err.message || "Save error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main><p>Loading...</p></main>;

  return (
    <main className="login-page">
      <section className="login-card" style={{ maxWidth: "560px" }}>
        <Link to={`/owner/restaurants/${restaurantId}/events`}>← Back</Link>
        <h1>{isEdit ? "Edit event" : "New event"}</h1>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Start (date & time)</label>
            <input
              name="start_datetime"
              type="datetime-local"
              value={form.start_datetime}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Duration (hours)</label>
            <input
              name="duration"
              type="number"
              min="1"
              value={form.duration}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Guest capacity</label>
            <input
              name="guest_capacity"
              type="number"
              min="1"
              value={form.guest_capacity}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Price per guest</label>
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </form>
      </section>
    </main>
  );
}