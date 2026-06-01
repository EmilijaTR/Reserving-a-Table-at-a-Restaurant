import { Navigate } from "react-router";
import { getStoredUser } from "../config/auth";

export default function CustomerGuard({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "c") {
    return <Navigate to="/owner/restaurants" replace />;
  }

  return children;
}
