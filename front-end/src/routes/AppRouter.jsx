import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "../components/Layout";

import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Restaurants from "../pages/Restaurants";
import RestaurantDetail from "../pages/RestaurantDetail";
import MyReservations from "../pages/MyReservations";
import CustomerGuard from "../components/CustomerGuard";
import ProfileLayout from "../components/ProfileLayout";
import ReservationsUpcoming from "../pages/profile/ReservationsUpcoming";
import ReservationsPast from "../pages/profile/ReservationsPast";
import EventsUpcoming from "../pages/profile/EventsUpcoming";
import EventsPast from "../pages/profile/EventsPast";

import OwnerGuard from "../components/OwnerGuard";
import OwnerRestaurants from "../pages/owner/OwnerRestaurants";
import OwnerRestaurantForm from "../pages/owner/OwnerRestaurantForm";
import OwnerReservations from "../pages/owner/OwnerReservations";

import RestaurantEvents from "../pages/RestaurantEvents";
import EventsBrowse from "../pages/EventsBrowse";
import EventDetail from "../pages/EventDetail";
import MyEventReservations from "../pages/MyEventReservations";
import OwnerEventsList from "../pages/owner/OwnerEventsList";
import OwnerEventForm from "../pages/owner/OwnerEventForm";
import OwnerEventBookings from "../pages/owner/OwnerEventBookings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/my-reservations" element={<MyReservations />} />

        <Route
          path="/profile"
          element={
            <CustomerGuard>
              <ProfileLayout />
            </CustomerGuard>
          }
        >
          <Route index element={<Navigate to="reservations/upcoming" replace />} />
          <Route path="reservations/upcoming" element={<ReservationsUpcoming />} />
          <Route path="reservations/past" element={<ReservationsPast />} />
          <Route path="events/upcoming" element={<EventsUpcoming />} />
          <Route path="events/past" element={<EventsPast />} />
        </Route>

        {/* Events - Public */}
        <Route
          path="/restaurants/:id/events"
          element={<RestaurantEvents />}
        />
        <Route path="/events" element={<EventsBrowse />} />
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
      </Layout>
    </BrowserRouter>
  );
}