import { Link, useNavigate } from "react-router";
import { getStoredUser, clearStoredUser } from "../config/auth";

export default function Menu() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    clearStoredUser();
    navigate("/login");
  }

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/restaurants">Restaurants</Link>
      <Link to="/about">About</Link>

      {!user && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}

      {user && (
        <>
          <span style={{ marginLeft: "8px" }}>
            {user.name} ({user.role === "o" ? "owner" : "customer"})
          </span>
          <button type="button" onClick={handleLogout} style={{ marginLeft: "8px" }}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
}