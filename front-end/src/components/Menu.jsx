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
    <header className="site-header">
      <nav className="site-nav">
        <Link to="/" className="site-logo">
          RESTABLE
        </Link>

        <div className="site-nav-links">
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/about">About</Link>

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-cta">
                Register
              </Link>
            </>
          )}

          {user && user.role === "o" && (
            <Link to="/owner/restaurants">My restaurants</Link>
          )}

          {user?.role === "c" && (
            <>
              <Link to="/my-reservations">My reservations</Link>
              <Link to="/my-event-reservations">Event bookings</Link>
            </>
          )}
        </div>

        {user && (
          <div className="site-nav-user">
            <span className="user-pill">
              {user.name}
              <small>{user.role === "o" ? "Owner" : "Customer"}</small>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
