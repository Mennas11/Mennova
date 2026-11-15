import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ProductCard from "../components/productCard";

function Favorites() {
  const favorites = useSelector((state) => state.favorites);

  return (
    <section className="page">
      <div className="page-head">
        <h1>My favorites</h1>
        {favorites.length > 0 && (
          <p>
            {favorites.length} saved {favorites.length === 1 ? "piece" : "pieces"}. Tap the heart to remove one.
          </p>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty">
          <h2>Nothing saved yet</h2>
          <p>Tap the heart on any product to keep it here.</p>
          <Link to="/products" className="btn" style={{ marginTop: 20 }}>
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;