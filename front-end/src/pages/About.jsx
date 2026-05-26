export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>About</h1>
        <p>
          RESTABLE is an information system for online table and event
          reservations at restaurants.
        </p>
      </section>

      <section className="about-content">
        <h2>Features</h2>
        <ul>
          <li>Browse restaurants and book a table</li>
          <li>Reviews and loyalty points</li>
          <li>Restaurant owners manage profile, reservations, and events</li>
        </ul>
      </section>
    </main>
  );
}