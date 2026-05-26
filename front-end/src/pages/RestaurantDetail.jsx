import { useParams, Link } from "react-router";

export default function RestaurantDetail() {
  const { id } = useParams();

  return (
    <main className="about-page">
      <section className="about-hero">
        <Link to="/restaurants">← Back to restaurants</Link>
        <h1>Restaurant #{id}</h1>
        <p>Detail page, reviews, and booking come in the next step.</p>
      </section>
    </main>
  );
}