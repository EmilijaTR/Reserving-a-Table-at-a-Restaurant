import { NavLink } from "react-router";

const linkClass = ({ isActive }) =>
  `profile-nav-link${isActive ? " profile-nav-link--active" : ""}`;

export default function ProfileSidebar() {
  return (
    <aside className="profile-sidebar">
      <p className="profile-sidebar-title">My profile</p>
      <nav className="profile-nav">
        <p className="profile-nav-group">My reservations</p>
        <NavLink to="/profile/reservations/upcoming" className={linkClass}>
          Upcoming
        </NavLink>
        <NavLink to="/profile/reservations/past" className={linkClass}>
          Past
        </NavLink>

        <p className="profile-nav-group">My events</p>
        <NavLink to="/profile/events/upcoming" className={linkClass}>
          Upcoming
        </NavLink>
        <NavLink to="/profile/events/past" className={linkClass}>
          Past
        </NavLink>
      </nav>
    </aside>
  );
}
