import { Navigate } from "react-router";
import { getStoredUser } from "../config/auth";

export default function OwnerGuard({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "o") {
    return <Navigate to="/" replace />;
  }

  return children;
}