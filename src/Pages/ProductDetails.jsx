import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct, sizesFor } from "../services/productsAPI";
import { addToCart } from "../features/cart/cartSlice";
import { toggleFavorite } from "../features/favorites/favoritesSlice";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const isFav = useSelector((state) =>
    state.favorites.some((item) => item.id === Number(id))
  );

  useEffect(() => {
    setLoading(true);
    setSize("");
    setActiveImage(0);
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setError("We couldn't find this product."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading product...</p>;
  if (error || !product) return <p className="loading">{error || "Product not found."}</p>;

  const sizes = sizesFor(product.group);
  const images = product.images?.length ? product.images : [product.thumbnail];

  function handleAdd() {
    if (sizes.length && !size) {
      setSizeError(true);
      return;
    }
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        size: size || null,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="page">
      <Link to="/products" className="back">← Back to shop</Link>

      <div className="details">
        <div>
          <div className="gallery-main">
            <img src={images[activeImage]} alt={product.title} />
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.slice(0, 5).map((src, i) => (
                <button
                  key={src}
                  className={i === activeImage ? "on" : ""}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info">
          <span className="cat">{product.category.replace("-", " ")}</span>
          <h1>{product.title}</h1>
          <div className="price">${product.price}</div>
          <p>{product.description}</p>
          <p>Rated {product.rating} out of 5</p>

          {sizes.length > 0 && (
            <>
              <p style={{ margin: "22px 0 0", color: "var(--ink)" }}>
                Size {sizeError && <span style={{ color: "var(--pink)" }}>– please choose one</span>}
              </p>
              <div className="sizes">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`size ${size === s ? "on" : ""}`}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="actions">
            <button className="btn" onClick={handleAdd}>
              {added ? "Added to cart ✓" : "Add to cart"}
            </button>
            <button
              className={`btn ghost ${isFav ? "on" : ""}`}
              aria-pressed={isFav}
              onClick={() => dispatch(toggleFavorite(product))}
            >
              {isFav ? "♥ Saved" : "♡ Save"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;