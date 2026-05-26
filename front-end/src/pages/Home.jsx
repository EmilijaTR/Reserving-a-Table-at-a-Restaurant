import { Link } from "react-router";

export default function Home() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>RESTABLE</h1>
        <p>Reserve a table at a restaurant — course project.</p>
        <p>
          <Link to="/login">Login</Link> to continue.
        </p>
      </section>
    </main>
  );
}