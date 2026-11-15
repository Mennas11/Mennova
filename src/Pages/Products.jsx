import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import ProductCard from "../components/productCard";
import { fetchAllProducts, GROUPS } from "../services/productsAPI";
import { rankProducts } from "../utils/recommend";

const PICKED_COUNT = 8;

function Products() {
  const [params, setParams] = useSearchParams();
  const group = params.get("group") || "all";
  const sort = params.get("sort") || "";
  const forYou = params.get("foryou") === "1";

  const answers = useSelector((state) => state.quiz.answers);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(() => setError("We couldn't load the products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        (group === "all" || p.group === group) &&
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (forYou && answers) {
      return rankProducts(list, answers).map((p, i) => ({
        ...p,
        picked: i < PICKED_COUNT,
      }));
    }

    if (sort === "new") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.meta?.createdAt || 0) - new Date(a.meta?.createdAt || 0)
      );
    }
    return list;
  }, [products, group, searchTerm, forYou, answers, sort]);

  if (loading) return <p className="loading">Loading products...</p>;

  return (
    <section className="page">
      <div className="page-head">
        <h1>{sort === "new" ? "New arrivals" : "Shop the collection"}</h1>
        <p>
          {forYou
            ? "Sorted by your style answers."
            : "Clothing, shoes, perfumes and makeup, picked for the Mennova woman and man."}
        </p>
      </div>

      {answers ? null : (
        <div className="quiz-hint">
          Want picks that match you? <Link to="/quiz">Take the style quiz</Link> and
          unlock a 25% coupon.
        </div>
      )}

      <div className="toolbar">
        <div className="tabs">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              className={`chip ${group === g.id ? "on" : ""}`}
              onClick={() => setParam("group", g.id === "all" ? "" : g.id)}
            >
              {g.label}
            </button>
          ))}

          {answers && (
            <button
              className={`chip ${forYou ? "on" : ""}`}
              onClick={() => setParam("foryou", forYou ? "" : "1")}
            >
              For you
            </button>
          )}
        </div>

        <input
          className="search"
          type="search"
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search products"
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} picked={product.picked} />
        ))}
      </div>

      {!error && visible.length === 0 && (
        <div className="empty">
          <h2>Nothing found</h2>
          <p>Try another word or pick a different category.</p>
        </div>
      )}
    </section>
  );
}

export default Products;