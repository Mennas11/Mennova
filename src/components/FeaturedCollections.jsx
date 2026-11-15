import { Link } from "react-router-dom";

const COLLECTIONS = [
  { group: "clothing", title: "Clothing", text: "Dresses, tops and shirts", a: "#7a2e3f", b: "#2a1820" },
  { group: "shoes", title: "Shoes", text: "From heels to sneakers", a: "#b98a58", b: "#5a3a22" },
  { group: "perfumes", title: "Perfumes", text: "Scents that stay", a: "#5a1f36", b: "#ff4d8d" },
  { group: "makeup", title: "Makeup", text: "Color for every tone", a: "#38222b", b: "#d9b27c" },
];

function FeaturedCollections() {
  return (
    <section className="collections">
      <h2>Find your style.</h2>

      <div className="coll-grid">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.group}
            to={`/products?group=${c.group}`}
            className="coll-tile"
            style={{ "--a": c.a, "--b": c.b }}
          >
            <h3>{c.title}</h3>
            <span>{c.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCollections;