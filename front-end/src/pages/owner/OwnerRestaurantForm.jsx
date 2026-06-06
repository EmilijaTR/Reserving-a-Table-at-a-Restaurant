import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL, uploadRestaurantFile } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";
import { validateOperatingHoursInput } from "../../config/operatingHours";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  operating_hours: "09:00-22:00",
  guest_capacity: "",
  menu: "",
  picture: "",
};

export default function OwnerRestaurantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [pictureFile, setPictureFile] = useState(null);
  const [menuFile, setMenuFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/restaurants/mine`, {
          headers: jsonAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.message || "Failed to load.");
          return;
        }
        const found = (data.restaurants || []).find(
          (r) => String(r.restaurant_id) === String(id)
        );
        if (!found) {
          if (!cancelled) setError("Restaurant not found.");
          return;
        }
        if (!cancelled) {
          setForm({
            name: found.name || "",
            address: found.address || "",
            phone: found.phone || "",
            email: found.email || "",
            operating_hours: found.operating_hours || "09:00-22:00",
            guest_capacity: String(found.guest_capacity ?? ""),
            menu: found.menu || "",
            picture: found.picture || "",
          });
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
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const hoursCheck = validateOperatingHoursInput(form.operating_hours);
      if (!hoursCheck.ok) {
        setError(hoursCheck.message);
        return;
      }

      let picturePath = form.picture;
      let menuPath = form.menu;

      if (pictureFile) {
        picturePath = await uploadRestaurantFile("upload/picture", pictureFile);
      }
      if (menuFile) {
        menuPath = await uploadRestaurantFile("upload/menu", menuFile);
      }

      const body = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        operating_hours: hoursCheck.normalized,
        guest_capacity: Number(form.guest_capacity),
        picture: picturePath || "",
        menu: menuPath || "",
      };

      const url = isEdit
        ? `${API_URL}/restaurants/${id}`
        : `${API_URL}/restaurants`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: jsonAuthHeaders(),
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          setError(`Server did not return JSON (${res.status}).`);
          return;
        }
      }

      if (res.ok && data.ok) {
        setMessage(isEdit ? "Restaurant updated." : "Restaurant created.");
        setTimeout(() => navigate("/owner/restaurants"), 1000);
      } else {
        setError(data.message || `Failed (${res.status}).`);
      }
    } catch (err) {
      console.log(err);
      setError(err.message || "Save error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="form-page">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="form-page">
      <Link to="/owner/restaurants">← My restaurants</Link>

      <header className="page-header" style={{ marginTop: "16px" }}>
        <h1>{isEdit ? "Edit restaurant" : "New restaurant"}</h1>
        <p>Add your venue details. Guests will see this on the restaurant page.</p>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="form-section-title">Basic information</h2>
          <p className="form-section-desc">Name, location, and contact details.</p>

          <div className="form-grid">
            <div className="form-field form-field--full">
              <label htmlFor="name">Restaurant name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Restaurant1"
                required
              />
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, city"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Hours & capacity</h2>
          <p className="form-section-desc">
            Used for the reservation grid and availability checks.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="operating_hours">Operating hours (every day)</label>
              <input
                id="operating_hours"
                name="operating_hours"
                type="text"
                value={form.operating_hours}
                onChange={handleChange}
                placeholder="09:00-22:00"
                pattern="([01][0-9]|2[0-3]):[0-5][0-9]-([01][0-9]|2[0-3]):[0-5][0-9]"
                title="Format HH:MM-HH:MM, e.g. 09:00-22:00"
                required
              />
              <p className="form-hint">
                Format <strong>HH:MM-HH:MM</strong> (24h). Minutes :00 or :30 only.
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="guest_capacity">Guest capacity</label>
              <input
                id="guest_capacity"
                name="guest_capacity"
                type="number"
                min="1"
                value={form.guest_capacity}
                onChange={handleChange}
                placeholder="e.g. 40"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Photos & menu</h2>
          <p className="form-section-desc">Optional files shown on your public page.</p>

          <div className="form-field">
            <label>Restaurant picture</label>
            <div className="file-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
              />
              {pictureFile && <p>Selected: {pictureFile.name}</p>}
              {!pictureFile && <p>JPG or PNG, shown on listings</p>}
            </div>
            {form.picture && (
              <img
                src={`${API_URL}${form.picture}`}
                alt="Current restaurant"
                style={{ maxWidth: "220px", marginTop: "12px", borderRadius: "8px" }}
              />
            )}
          </div>

          <div className="form-field">
            <label>Menu (PDF)</label>
            <div className="file-zone">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
              />
              {menuFile && <p>Selected: {menuFile.name}</p>}
              {!menuFile && <p>Upload your menu as PDF</p>}
            </div>
            {form.menu && (
              <p style={{ marginTop: "8px" }}>
                <a href={`${API_URL}${form.menu}`} target="_blank" rel="noreferrer">
                  View current menu (PDF)
                </a>
              </p>
            )}
          </div>
        </section>

        {!isEdit && (
          <div className="owner-loyalty-notice">
            <p>
              By pressing <strong>Create restaurant</strong>, you agree to the RESTABLE
              loyalty programme. Diners earn one point for each completed reservation.
              After collecting <strong>5 points</strong>, a customer is eligible for a{" "}
              <strong>5% discount</strong> on their next booking at your restaurant.
            </p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create restaurant"}
          </button>
          <Link to="/owner/restaurants" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
