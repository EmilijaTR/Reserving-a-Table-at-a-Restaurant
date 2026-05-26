import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "../components/Menu";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}