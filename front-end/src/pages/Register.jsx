import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { API_URL } from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "o" ? "o" : "c";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: "Invalid response from server." };
        }
      }

      if (res.ok && data.ok) {
        setMessage("Registration successful. Redirecting to login…");
        setIsError(false);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || `Registration failed (${res.status}).`);
        setIsError(true);
      }
    } catch (err) {
      console.log("Register error:", err);
      setMessage("Registration error. Check API_URL and backend.");
      setIsError(true);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Join RESTABLE as a customer or restaurant owner.</p>

        {message && (
          <p className={`alert ${isError ? "alert-error" : "alert-success"}`}>{message}</p>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-field">
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-field">
            <label style={{ marginBottom: "4px" }}>I am registering as</label>
            <div className="role-picker">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="c"
                  checked={role === "c"}
                  onChange={() => setRole("c")}
                />
                Customer
                <span>Book tables and events</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="o"
                  checked={role === "o"}
                  onChange={() => setRole("o")}
                />
                Restaurant owner
                <span>Manage your venue</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
