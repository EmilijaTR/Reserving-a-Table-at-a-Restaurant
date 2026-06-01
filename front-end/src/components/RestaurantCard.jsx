import { Link } from "react-router";
import { API_URL } from "../config/api";

export default function RestaurantCard({ restaurant }) {
  return (
    <article className="card restaurant-card">
      {restaurant.picture ? (
        <img
          className="restaurant-card-image"
          src={`${API_URL}${restaurant.picture}`}
          alt={restaurant.name}
        />
      ) : (
        <div className="restaurant-card-image restaurant-card-image--placeholder" aria-hidden>
          {restaurant.name.charAt(0)}
        </div>
      )}
      <div className="restaurant-card-body">
        <h2>{restaurant.name}</h2>
        <p className="restaurant-card-meta">{restaurant.address}</p>
        <p className="restaurant-card-meta">
          {restaurant.operating_hours} · up to {restaurant.guest_capacity} guests
        </p>
        <Link
          to={`/restaurants/${restaurant.restaurant_id}`}
          className="btn btn-primary btn-sm"
        >
          View & book
        </Link>
      </div>
    </article>
  );
}
