export default function About() {
  return (
    <main>
      <header className="page-header">
        <h1>About RESTABLE</h1>
        <p>
          An information system for online table and event reservations at
          restaurants — built as a student project.
        </p>
      </header>

      <section className="page-section">
        <h2>What you can do</h2>
        <ul>
          <li>Browse restaurants and book a table online</li>
          <li>Earn loyalty points and use discounts on reservations</li>
          <li>Leave reviews after completed visits</li>
          <li>Book tickets for restaurant events</li>
          <li>
            Restaurant owners manage their profile, daily reservation grid,
            walk-ins, and events
          </li>
        </ul>
      </section>
    </main>
  );
}
