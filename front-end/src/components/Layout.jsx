import Menu from "./Menu";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Menu />
      {children}
      <Footer />
    </div>
  );
}
