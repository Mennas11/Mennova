// import { useRef, useState } from "react";
// import { Link } from "react-router-dom";

// import Reveal from "./Reveal";

// // Placeholder looks. With the backend these come from MongoDB.
// const LOOKS = {
//   Everyday: [
//     { name: "Soft Sunday", shape: "dress", a: "#f3b8c9", b: "#7a2e3f", items: "Dress · Heels · Tote", price: 214 },
//     { name: "City Walk", shape: "coat", a: "#d9b27c", b: "#5a3a22", items: "Coat · Bag · Boots", price: 268 },
//     { name: "Coffee Run", shape: "dress", a: "#8a9a6b", b: "#2f3d2a", items: "Dress · Sneakers · Tote", price: 189 },
//   ],
//   Work: [
//     { name: "Boardroom", shape: "coat", a: "#5d6b7a", b: "#1a0f14", items: "Coat · Trousers · Bag", price: 342 },
//     { name: "Monday Calm", shape: "dress", a: "#5d6b7a", b: "#1f2a44", items: "Dress · Blazer · Flats", price: 276 },
//     { name: "Quiet Power", shape: "coat", a: "#b98a58", b: "#5a3a22", items: "Coat · Heels · Bag", price: 318 },
//   ],
//   Evening: [
//     { name: "After Dark", shape: "dress", a: "#ff4d8d", b: "#4a1d33", items: "Dress · Clutch · Heels", price: 298 },
//     { name: "Velvet Hour", shape: "dress", a: "#7a2e3f", b: "#1a0f14", items: "Dress · Heels · Earrings", price: 325 },
//     { name: "Gold Room", shape: "dress", a: "#d9b27c", b: "#7a2e3f", items: "Dress · Clutch · Heels", price: 351 },
//   ],
//   Wedding: [
//     { name: "The Guest", shape: "dress", a: "#c9b6d9", b: "#5d4a7a", items: "Dress · Heels · Clutch", price: 389 },
//     { name: "Garden Party", shape: "dress", a: "#f3b8c9", b: "#d9b27c", items: "Dress · Wedges · Bag", price: 362 },
//     { name: "Black Tie", shape: "dress", a: "#2a2630", b: "#7a2e3f", items: "Gown · Heels · Clutch", price: 420 },
//   ],
// };

// function LookCard({ look }) {
//   const ref = useRef(null);
//   const [flip, setFlip] = useState(false);

//   const toggle = () => {
//     setFlip(!flip);
//     if (ref.current) ref.current.style.transform = "";
//   };

//   const tilt = (e) => {
//     if (flip || !ref.current) return;
//     const r = ref.current.getBoundingClientRect();
//     const x = (e.clientX - r.left) / r.width - 0.5;
//     const y = (e.clientY - r.top) / r.height - 0.5;
//     ref.current.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 20}deg) translateY(-8px)`;
//   };

//   const reset = () => {
//     if (!flip && ref.current) ref.current.style.transform = "";
//   };

//   return (
//     <div
//       ref={ref}
//       className={`h-c3 ${flip ? "flip" : ""}`}
//       role="button"
//       tabIndex={0}
//       aria-pressed={flip}
//       aria-label={`${look.name}. Press to flip the card.`}
//       onClick={toggle}
//       onKeyDown={(e) => {
//         if (e.key === "Enter" || e.key === " ") {
//           e.preventDefault();
//           toggle();
//         }
//       }}
//       onPointerMove={tilt}
//       onPointerLeave={reset}
//     >
//       <div className="h-face h-front" style={{ "--a": look.a, "--b": look.b }}>
//         <small>Tap to flip</small>
//         <svg viewBox="0 0 100 160" aria-hidden="true">
//           <use href={`#sil-${look.shape}`} />
//         </svg>
//         <strong>{look.name}</strong>
//       </div>

//       <div className="h-face h-back">
//         <b>{look.name}</b>
//         <span>{look.items}</span>
//         <b>${look.price}</b>
//         <Link to="/products?foryou=1" onClick={(e) => e.stopPropagation()}>
//           Shop the look →
//         </Link>
//       </div>
//     </div>
//   );
// }

// function LooksSection() {
//   const [occasion, setOccasion] = useState("Everyday");

//   return (
//     <section className="h-sec alt" id="looks">
//       {/* silhouettes used by the cards */}
//       <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
//         <defs>
//           <symbol id="sil-dress" viewBox="0 0 100 160">
//             <path d="M38 4h24l4 30 12 6-8 20 20 96H10L30 60 22 40l12-6z" />
//           </symbol>
//           <symbol id="sil-coat" viewBox="0 0 100 160">
//             <path d="M30 6l20 12 20-12 24 30-10 118H66V70H34v84H16L6 36z" />
//           </symbol>
//         </defs>
//       </svg>

//       <Reveal className="h-head">
//         <h2>
//           Looks for <em>every occasion</em>.
//         </h2>
//         <div className="tabs" role="group" aria-label="Occasion">
//           {Object.keys(LOOKS).map((name) => (
//             <button
//               key={name}
//               className={`chip pill ${occasion === name ? "on" : ""}`}
//               aria-pressed={occasion === name}
//               onClick={() => setOccasion(name)}
//             >
//               {name}
//             </button>
//           ))}
//         </div>
//       </Reveal>

//       <div className="h-row3" key={occasion}>
//         {LOOKS[occasion].map((look) => (
//           <LookCard key={look.name} look={look} />
//         ))}
//       </div>
//     </section>
//   );
// }

// export default LooksSection;




import { useState } from "react";
import { Link } from "react-router-dom";
import "./looksSection.css";

const LOOKS = {
  Everyday: [
    {
      name: "Soft Sunday",
      category: "EFFORTLESS ELEGANCE",
      items: "Dress · Heels · Tote",
      price: 214,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
      number: "01",
    },
    {
      name: "City Walk",
      category: "URBAN ESSENTIALS",
      items: "Coat · Bag · Boots",
      price: 268,
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
      number: "02",
    },
    {
      name: "Coffee Run",
      category: "CASUAL CHIC",
      items: "Dress · Sneakers · Tote",
      price: 189,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
      number: "03",
    },
  ],

  Work: [
    {
      name: "Boardroom",
      category: "POWER DRESSING",
      items: "Blazer · Trousers · Bag",
      price: 342,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
      number: "01",
    },
    {
      name: "Monday Calm",
      category: "MODERN MINIMALISM",
      items: "Dress · Blazer · Flats",
      price: 276,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
      number: "02",
    },
    {
      name: "Quiet Power",
      category: "TIMELESS TAILORING",
      items: "Coat · Heels · Bag",
      price: 318,
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
      number: "03",
    },
  ],

  Evening: [
    {
      name: "After Dark",
      category: "EVENING GLAMOUR",
      items: "Dress · Clutch · Heels",
      price: 298,
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
      number: "01",
    },
    {
      name: "Velvet Hour",
      category: "UNDERSTATED LUXURY",
      items: "Dress · Heels · Earrings",
      price: 325,
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85",
      number: "02",
    },
    {
      name: "Gold Room",
      category: "GOLDEN DETAILS",
      items: "Dress · Clutch · Heels",
      price: 351,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=85",
      number: "03",
    },
  ],

  Wedding: [
    {
      name: "The Guest",
      category: "OCCASION EDIT",
      items: "Dress · Heels · Clutch",
      price: 389,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
      number: "01",
    },
    {
      name: "Garden Party",
      category: "ROMANTIC DETAILS",
      items: "Dress · Wedges · Bag",
      price: 362,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
      number: "02",
    },
    {
      name: "Black Tie",
      category: "FORMAL EDITION",
      items: "Gown · Heels · Clutch",
      price: 420,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
      number: "03",
    },
  ],
};

function LookCard({ look }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <article className={`look-card ${flipped ? "is-flipped" : ""}`}>
      <div className="look-card-inner">

        {/* FRONT */}
        <div className="look-card-front">

          <div className="look-card-image">
            <img
              src={look.image}
              alt={`${look.name} fashion outfit`}
              loading="lazy"
            />

            <span className="look-number">
              {look.number} / 03
            </span>

            <span className="look-category">
              {look.category}
            </span>

            <button
              className="look-view-button"
              onClick={() => setFlipped(true)}
              aria-label={`View details for ${look.name}`}
            >
              DISCOVER THE LOOK
              <span>↗</span>
            </button>
          </div>

          <div className="look-card-info">
            <div>
              <span className="look-subtitle">
                THE MENNOVA EDIT
              </span>
              <h3>{look.name}</h3>
            </div>

            <span className="look-arrow">↗</span>
          </div>

        </div>

        {/* BACK */}
        <div className="look-card-back">

          <span className="look-back-label">
            THE MENNOVA EDIT / {look.number}
          </span>

          <div className="look-back-content">
            <span>CURATED FOR YOU</span>
            <h3>{look.name}</h3>
            <p>{look.items}</p>

            <div className="look-price">
              ${look.price.toFixed(2)}
            </div>

            <p className="look-description">
              A carefully curated combination designed
              to bring effortless style to your wardrobe.
            </p>

            <Link
              to="/products?foryou=1"
              className="look-shop-button"
            >
              SHOP THIS LOOK <span>→</span>
            </Link>

            <button
              className="look-back-button"
              onClick={() => setFlipped(false)}
            >
              ← BACK TO THE LOOK
            </button>
          </div>

          <span className="look-back-footer">
            MENNOVA — PERSONAL STYLE, REDEFINED
          </span>

        </div>
      </div>
    </article>
  );
}

export default function LooksSection() {
  const [occasion, setOccasion] = useState("Everyday");

  const occasions = Object.keys(LOOKS);

  return (
    <section className="looks-section" id="looks">

      {/* SECTION HEADER */}
      <div className="looks-header">

        <div className="looks-heading">
          <span className="looks-overline">
            DISCOVER YOUR STYLE
          </span>

          <h2>
            Looks for <em>every occasion.</em>
          </h2>

          <p>
            Thoughtfully curated outfits for every version of you.
          </p>
        </div>

        <span className="looks-index">
          STYLE JOURNAL — 001
        </span>

      </div>

      {/* OCCASION FILTERS */}
      <div className="looks-navigation">
        <div className="looks-tabs" role="group" aria-label="Filter by occasion">
          {occasions.map((name) => (
            <button
              key={name}
              className={`looks-tab ${
                occasion === name ? "active" : ""
              }`}
              onClick={() => setOccasion(name)}
              aria-pressed={occasion === name}
            >
              {name}
            </button>
          ))}
        </div>

        <span className="looks-count">
          03 CURATED LOOKS
        </span>
      </div>

      {/* LOOK CARDS */}
      <div className="looks-grid" key={occasion}>
        {LOOKS[occasion].map((look) => (
          <LookCard key={look.name} look={look} />
        ))}
      </div>

      {/* SECTION FOOTER */}
      <div className="looks-footer">
        <span>FIND YOUR SIGNATURE STYLE.</span>
        <span>MENNOVA © 2026</span>
      </div>

    </section>
  );
}
