import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { setStoredUser } from "../config/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStoredUser(data.user);
        setMessage("Welcome back!");
        setIsError(false);
        navigate("/");
      } else {
        setMessage(data.message || "Login failed.");
        setIsError(true);
      }
    } catch (err) {
      console.log("Login error:", err);
      setMessage("Login error. Is the backend running?");
      setIsError(true);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to book tables or manage your restaurant.</p>

        {message && (
          <p className={`alert ${isError ? "alert-error" : "alert-success"}`}>{message}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
