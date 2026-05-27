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

import RestaurantEvents from "../pages/RestaurantEvents";
import EventDetail from "../pages/EventDetail";
import MyEventReservations from "../pages/MyEventReservations";
import OwnerEventsList from "../pages/owner/OwnerEventsList";
import OwnerEventForm from "../pages/owner/OwnerEventForm";
import OwnerEventBookings from "../pages/owner/OwnerEventBookings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Menu />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/my-reservations" element={<MyReservations />} />

        {/* Events - Public */}
        <Route
          path="/restaurants/:id/events"
          element={<RestaurantEvents />}
        />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route
          path="/my-event-reservations"
          element={<MyEventReservations />}
        />

        {/* Owner - Restaurants */}
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

        {/* Owner - Events */}
        <Route
          path="/owner/restaurants/:id/events"
          element={
            <OwnerGuard>
              <OwnerEventsList />
            </OwnerGuard>
          }
        />
        <Route
          path="/owner/restaurants/:id/events/new"
          element={
            <OwnerGuard>
              <OwnerEventForm />
            </OwnerGuard>
          }
        />
        <Route
          path="/owner/restaurants/:id/events/:eventId/edit"
          element={
            <OwnerGuard>
              <OwnerEventForm />
            </OwnerGuard>
          }
        />
        <Route
          path="/owner/events/:eventId/bookings"
          element={
            <OwnerGuard>
              <OwnerEventBookings />
            </OwnerGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}