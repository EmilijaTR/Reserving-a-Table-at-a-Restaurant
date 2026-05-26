import { Link } from "react-router";

export default function Menu() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      {!user && <Link to="/login">Login</Link>}
      {user && (
        <span style={{ marginLeft: "12px" }}>
          Hello, {user.name} ({user.role === "o" ? "owner" : "customer"})
        </span>
      )}
    </nav>
  );
}