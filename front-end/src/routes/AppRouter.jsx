import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "../components/Menu";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Restaurants from "../pages/Restaurants";
import RestaurantDetail from "../pages/RestaurantDetail";
import MyReservations from "../pages/MyReservations";
import OwnerGuard from "../components/OwnerGuard";
import OwnerRestaurants from "../pages/owner/OwnerRestaurants";
import OwnerRestaurantForm from "../pages/owner/OwnerRestaurantForm";
import OwnerReservations from "../pages/owner/OwnerReservations";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route
        path="/owner/restaurants"
        element={
          <OwnerGuard>
            <OwnerRestaurants />
          </OwnerGuard>
        }
      />
      <Route
        path="/owner/restaurants/new"
        element={
          <OwnerGuard>
            <OwnerRestaurantForm />
          </OwnerGuard>
        }
      />
      <Route
        path="/owner/restaurants/:id/edit"
        element={
          <OwnerGuard>
            <OwnerRestaurantForm />
          </OwnerGuard>
        }
      />
      <Route
        path="/owner/restaurants/:id/reservations"
        element={
          <OwnerGuard>
            <OwnerReservations />
          </OwnerGuard>
        }
      />
      </Routes>
    </BrowserRouter>
  );
}