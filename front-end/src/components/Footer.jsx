import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-logo">RESTABLE</p>
          <p className="site-footer-tagline">
            Book tables and events at your favourite restaurants.
          </p>
        </div>
        <div>
          <p className="site-footer-heading">Explore</p>
          <ul className="site-footer-links">
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
            <li><Link to="/events">Events</Link></li>
          </ul>
        </div>
        <div>
          <p className="site-footer-heading">Account</p>
          <ul className="site-footer-links">
            <li><Link to="/profile">My profile</Link></li>
          </ul>
        </div>
      </div>
      <p className="site-footer-copy">© {new Date().getFullYear()} RESTABLE</p>
    </footer>
  );
}
