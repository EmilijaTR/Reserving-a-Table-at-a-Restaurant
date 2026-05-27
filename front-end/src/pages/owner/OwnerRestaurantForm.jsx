import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL, uploadRestaurantFile } from "../../config/api";
import { jsonAuthHeaders } from "../../config/auth";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  operating_hours: "",
  guest_capacity: "",
  menu: "",
  picture: "",
};

const textFields = [
  ["name", "Name", "text"],
  ["address", "Address", "text"],
  ["phone", "Phone", "text"],
  ["email", "Email", "email"],
  ["operating_hours", "Operating hours", "text"],
  ["guest_capacity", "Guest capacity", "number"],
];

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
            operating_hours: found.operating_hours || "",
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
        operating_hours: form.operating_hours,
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
          data = { message: "Invalid response." };
        }
      }

      if (res.ok && data.ok) {
        setMessage(isEdit ? "Restaurant updated." : "Restaurant created.");
        setPictureFile(null);
        setMenuFile(null);
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
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card" style={{ maxWidth: "560px" }}>
        <Link to="/owner/restaurants">← Back</Link>
        <h1>{isEdit ? "Edit restaurant" : "New restaurant"}</h1>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>
          {textFields.map(([name, label, type]) => (
            <div key={name}>
              <label>{label}</label>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div>
            <label>Restaurant picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
            />
            {pictureFile && (
              <p style={{ fontSize: "0.9rem" }}>Selected: {pictureFile.name}</p>
            )}
            {form.picture && (
              <img
                src={`${API_URL}${form.picture}`}
                alt="Restaurant"
                style={{ maxWidth: "200px", marginTop: "8px", display: "block" }}
              />
            )}
          </div>

          <div>
            <label>Menu (PDF)</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
            />
            {menuFile && (
              <p style={{ fontSize: "0.9rem" }}>Selected: {menuFile.name}</p>
            )}
            {form.menu && (
              <p style={{ marginTop: "8px" }}>
                <a href={`${API_URL}${form.menu}`} target="_blank" rel="noreferrer">
                  View current menu (PDF)
                </a>
              </p>
            )}
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </form>
      </section>
    </main>
  );
}