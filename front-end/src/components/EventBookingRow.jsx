import { Link } from "react-router";
import { formatDateTime, statusLabel } from "../utils/reservationFilters";

export default function EventBookingRow({ booking, showCancel, onCancel }) {
  return (
    <article className="reservation-row">
      <div className="reservation-row-main">
        <div className="reservation-row-info">
          <h3>{booking.title}</h3>
          <p className="reservation-row-sub">{booking.restaurant_name}</p>
          <p className="reservation-row-meta">
            <span>Guests: {booking.guest_count}</span>
            <span>{formatDateTime(booking.start_datetime)}</span>
            <span
              className={`status-badge status-badge--${
                booking.status === "no-show" ? "noshow" : booking.status
              }`}
            >
              {statusLabel(booking.status)}
            </span>
          </p>
        </div>
        <div className="reservation-row-actions">
          <Link to={`/events/${booking.event_id}`} className="btn btn-ghost btn-sm">
            Details
          </Link>
          {showCancel && booking.status === "pending" && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onCancel(booking.event_res_id)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
