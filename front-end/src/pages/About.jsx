import { Link } from "react-router";

export default function About() {
  return (
    <main className="about-page">
      <header className="page-header">
        <h1>About RESTABLE</h1>
        <p>
          RESTABLE is a reservation system that lets you book a table wherever you
          are, at the restaurant you like in just a few clicks.
        </p>
      </header>

      <section className="page-section about-intro">
        <p>
          Find a place that suits you. Browse venues, compare opening hours and
          capacity, and read reviews from other guests to help you decide. Pick a
          date and time, confirm your booking, and you are done! No phone calls or 
          waiting on hold.
        </p>
        <p>
          You can also discover and book special events at participating
          restaurants, all from the same account.
        </p>
      </section>

      <section className="page-section">
        <h2>For diners</h2>
        <p>
          Search for restaurants by name or location, open a profile to see the
          menu and what others are saying, then reserve a table online. After a
          few clicks, your reservation is placed and waiting for the restaurant.
        </p>
        <p>
          <strong>Reviews</strong> Our community shares ratings and comments
          after their visits. Use them as a guide when you are choosing where to
          eat.
        </p>
        <p>
          <strong>Loyalty &amp; discounts</strong> After five confirmed
          reservations, you earn five loyalty points and receive a{" "}
          <strong>5% discount</strong> on your next booking. The owner marks your
          visit as completed when you show up at the restaurant; that is when you
          receive your point.
        </p>
        <p className="about-note">
          Please <strong>cancel in time</strong> if you cannot make it. If you do
          not show up without cancelling, you may lose a point — the same way a
          completed visit earns one.
        </p>
        <p>
          <Link to="/restaurants" className="btn btn-primary btn-sm">
            Browse restaurants
          </Link>
        </p>
      </section>

      <section className="page-section about-owner-block">
        <h2>For restaurant owners</h2>
        <p>
          Increase your visibility and turn more visitors into diners. RESTABLE
          puts your restaurant in front of people who are already looking to book
          a table online.
        </p>
        <p>
          Manage your profile, operating hours, and capacity. Use the daily
          reservation grid to see who is coming and when, add walk-ins, and mark
          visits as completed or no-show. Host events and sell tickets through the
          same system.
        </p>
        <p>
          Capture reservations in one place so taking a booking is as easy as
          possible for your guests and for your team.
        </p>
        <p>
          <Link to="/register?role=o" className="btn btn-primary btn-sm">
            Register your restaurant
          </Link>
        </p>
      </section>

      <section className="page-section about-footer-blurb">
        <h2>Get started</h2>
        <p className="text-muted">
          New here? Create a customer account to book tables and events, or
          register as an owner to list your venue.
        </p>
        <p className="about-cta-row">
          <Link to="/register" className="btn btn-primary btn-sm">
            Register
          </Link>
          <Link to="/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
