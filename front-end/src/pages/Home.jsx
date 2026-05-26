import { Link } from "react-router";

export default function Home() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>RESTABLE</h1>
        <p>Reserve a table at a restaurant.</p>
        <p>
          <Link to="/restaurants">Browse restaurants</Link>
          {" · "}
          <Link to="/register">Register</Link>
          {" · "}
          <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}