import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Hero3D from "../components/Hero3d";
import LooksSection from "../components/looksSection";
import ProductCard from "../components/productCard";
import Reveal from "../components/Reveal";
import { fetchAllProducts } from "../services/productsAPI";

const WORDS = ["Find your tone", "Build your look", "Shop in one tap", "Dress like you mean it"];

// the moving strip with the sparkles
function Marquee() {
  const row = [...WORDS, ...WORDS, ...WORDS, ...WORDS];
  return (
    <div className="h-marq" aria-hidden="true">
      <div>
        {row.map((w, i) => (
          <span key={i}>
            {w} <b>✦</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const quizDone = useSelector((state) => Boolean(state.quiz.answers));

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // the 4 newest products
  const newIn = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.meta?.createdAt || 0) - new Date(a.meta?.createdAt || 0))
        .slice(0, 4),
    [products]
  );

  // soft light that follows the cursor in the hero
  const spotlight = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <>
      <header className="h-hero" onPointerMove={spotlight}>
        <Reveal>
          <span className="eyebrow">Your personal style guide</span>
          <h1>
            Know what <em>suits</em> you.
          </h1>
          <p>
            Tell us your tone, your shape and your taste. We build complete looks that fit you, then you shop them in
            one tap.
          </p>
          <div className="h-ctas">
            {quizDone ? (
              <Link to="/products?foryou=1" className="btn">See my picks</Link>
            ) : (
              <Link to="/quiz" className="btn">Take the style quiz</Link>
            )}
            <a href="#looks" className="btn ghost">See the looks</a>
          </div>
        </Reveal>

        <Hero3D defaultDress="#ff4d8d" />
      </header>

      <Marquee />

      <section className="h-sec" id="how">
        <Reveal className="h-head">
          <h2>
            Three steps. <em>Zero guessing.</em>
          </h2>
        </Reveal>
        <Reveal className="h-steps">
          <div className="h-step">
            <i>01</i>
            <h3>Tell us about you</h3>
            <p>Seven quick questions: tone, body type, colors and the styles you love.</p>
          </div>
          <div className="h-step">
            <i>02</i>
            <h3>See your looks</h3>
            <p>We assemble full outfits in colors that flatter you.</p>
          </div>
          <div className="h-step">
            <i>03</i>
            <h3>Shop it in one tap</h3>
            <p>Add the whole look to your bag, with your member coupon waiting.</p>
          </div>
        </Reveal>
      </section>

      <LooksSection />

      <section className="h-sec" id="new">
        <Reveal className="h-head">
          <h2>
            Just <em>arrived</em>.
          </h2>
          <Link to="/products?sort=new" className="btn ghost">Shop everything</Link>
        </Reveal>
        <Reveal className="grid">
          {newIn.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Reveal>
      </section>

      <Reveal className="h-cta">
        <span className="eyebrow">Members only</span>
        <h2>
          Finish the quiz.
          <br />
          <em>Get 25% off.</em>
        </h2>
        <div className="h-code">STYLE25</div>
        <br />
        {!isAuthenticated ? (
          <Link to="/register" className="btn">Create my account</Link>
        ) : quizDone ? (
          <Link to="/products?foryou=1" className="btn">See my picks</Link>
        ) : (
          <Link to="/quiz" className="btn">Take the style quiz</Link>
        )}
      </Reveal>
    </>
  );
}

export default Home;