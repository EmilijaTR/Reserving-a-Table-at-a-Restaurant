import { Navigate } from "react-router";

/** Legacy URL → profile */
export default function MyEventReservations() {
  return <Navigate to="/profile/events/upcoming" replace />;
}
