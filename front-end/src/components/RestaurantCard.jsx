import { Link } from "react-router";

export default function RestaurantCard({ restaurant }) {
  return (
    <article className="news-item">
      <h2>{restaurant.name}</h2>
      <p>{restaurant.address}</p>
      <p>
        <strong>Hours:</strong> {restaurant.operating_hours}
      </p>
      <p>
        <strong>Capacity:</strong> {restaurant.guest_capacity} guests
      </p>
      <Link to={`/restaurants/${restaurant.restaurant_id}`}>View details</Link>
    </article>
  );
}