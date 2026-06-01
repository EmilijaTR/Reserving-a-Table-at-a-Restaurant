import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { getStoredUser, clearStoredUser } from "../config/auth";
import { refreshCurrentUser } from "../config/userApi";

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored?.role === "c") {
      refreshCurrentUser().then((u) => {
        if (u) setUser(u);
      });
    }
  }, [location.pathname]);

  function handleLogout() {
    clearStoredUser();
    setUser(null);
    navigate("/login");
  }

  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link to="/" className="site-logo">
          RESTABLE
        </Link>

        <div className="site-nav-right">
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/events">Events</Link>

          {user?.role === "c" && (
            <>
              <span className="nav-points">{user.points ?? 0} points</span>
              <Link to="/profile" className="nav-profile">
                {user.name}
              </Link>
            </>
          )}

          {user?.role === "o" && (
            <>
              <Link to="/owner/restaurants">My restaurants</Link>
              <span className="nav-profile nav-profile--static">{user.name}</span>
            </>
          )}

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-cta">
                Register
              </Link>
            </>
          )}

          {user && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
