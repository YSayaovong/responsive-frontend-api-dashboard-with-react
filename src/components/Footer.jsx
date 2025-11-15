import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer__row">
        <p>© {new Date().getFullYear()} Blinker — All rights reserved.</p>

        <nav className="footer__menu">
          <Link to="/">Home</Link>
          <Link to="/browse">Find your car</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
