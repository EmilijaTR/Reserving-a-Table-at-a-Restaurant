import { Navigate } from "react-router";

/** Legacy URL → profile */
export default function MyReservations() {
  return <Navigate to="/profile/reservations/upcoming" replace />;
}
