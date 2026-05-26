import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("c");
  const [message, setMessage] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

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
        setMessage("Registration successful. You can log in.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || `Registration failed (${res.status}).`);
      }
    } catch (err) {
      console.log("Register error:", err);
      setMessage("Registration error. Check API_URL and backend.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Register</h1>

        <form onSubmit={handleRegister}>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password (min 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div>
            <label>I am registering as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="c">Customer</option>
              <option value="o">Owner of a restaurant</option>
            </select>
          </div>

          <button type="submit">Register</button>
        </form>

        {message && <p>{message}</p>}

        <p style={{ marginTop: "16px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}