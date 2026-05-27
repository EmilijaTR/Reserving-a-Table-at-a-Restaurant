import { Link } from "react-router";
import { API_URL } from "../config/api";
export default function RestaurantCard({ restaurant }) {
  return (
    <article className="news-item">
      <h2>{restaurant.name}</h2>
      {restaurant.picture && (
        <img
          src={`${API_URL}${restaurant.picture}`}
          alt={restaurant.name}
          style={{ width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "8px" }}
        />
      )}
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