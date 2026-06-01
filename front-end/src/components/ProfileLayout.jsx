import { Outlet } from "react-router";
import ProfileSidebar from "./ProfileSidebar";

export default function ProfileLayout() {
  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar />
        <div className="profile-main">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
