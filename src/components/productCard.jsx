import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { toggleFavorite } from "../features/favorites/favoritesSlice";

function ProductCard({ product, picked = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isFav = useSelector((state) =>
    state.favorites.some((item) => item.id === product.id)
  );

  const open = () => navigate(`/products/${product.id}`);

  return (
    <article className="card">
      <div className="card-img" onClick={open}>
        <img src={product.thumbnail} alt={product.title} loading="lazy" />

        {picked && <span className="pick">Picked for you</span>}

        <button
          className={`fav-btn ${isFav ? "on" : ""}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFav}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavorite(product));
          }}
        >
          {isFav ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-body">
        <h3 onClick={open}>{product.title}</h3>
        <span>${product.price}</span>
      </div>
    </article>
  );
}

export default ProductCard;s