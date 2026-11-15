import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./layouts/Navbar";

function App() {
  const mode = useSelector((state) => state.theme.mode);

  // puts data-theme="dark" or "light" on <html>, the CSS reads it
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <b>Mennova</b>
        <span>Style that speaks you. © 2026</span>
      </footer>
      <ScrollRestoration />
    </div>
  );
}

export default App;