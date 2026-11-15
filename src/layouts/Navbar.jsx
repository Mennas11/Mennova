import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../features/auth/authSlice";
import { clearQuiz } from "../features/quiz/quizSlice";
import { toggleTheme } from "../features/theme/themeSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.favorites);
  const mode = useSelector((state) => state.theme.mode);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const close = () => setOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearQuiz());
    close();
    navigate("/");
  };

  return (
    <nav className={`nav ${open ? "open" : ""}`}>
      <Link to="/" className="nav-logo" onClick={close}>
        Mennova
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>

      <div className="nav-links">
        <NavLink to="/" end onClick={close}>Home</NavLink>
        <NavLink to="/products" end onClick={close}>Shop</NavLink>
        <NavLink to="/products?sort=new" onClick={close}>New arrivals</NavLink>
        <NavLink to="/quiz" onClick={close}>My style</NavLink>
      </div>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Switch between dark and light mode"
          aria-pressed={mode === "light"}
        >
          <span>{mode === "dark" ? "Dark" : "Light"}</span>
          <i />
        </button>

        <Link to="/favorites" onClick={close}>
          Favorites
          {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
        </Link>

        <Link to="/cart" onClick={close}>
          Cart
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>

        {isAuthenticated ? (
          <>
            <span className="nav-user">Hi, {user?.name?.split(" ")[0]}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={close}>Log in</Link>
            <Link to="/register" className="btn small" onClick={close} style={{ padding: "9px 18px" }}>
              Join
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;