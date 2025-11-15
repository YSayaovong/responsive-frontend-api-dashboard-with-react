import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav__row">
        <Link className="brand" to="/">
          <span className="brand__mark"></span>
          <span className="brand__text">blinker</span>
        </Link>

        <nav className="menu">
          <Link to="/" className="menu__link">
            Home
          </Link>
          <Link to="/browse" className="menu__link">
            Find your car
          </Link>
          <Link to="/contact" className="btn btn--pill">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
