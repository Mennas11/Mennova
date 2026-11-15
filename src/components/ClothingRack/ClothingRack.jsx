import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { toggleFavorite } from "../../features/favorites/favoritesSlice";
import "./ClothingRack.css";

// ---- tweak the feel here ----
const IDLE_SPEED = 0.25; // how fast the rack drifts on its own
const MAX_SPEED = 5; // top speed when the cursor is near an edge
const DEADZONE = 0.12; // middle zone where the cursor does nothing
const MAX_SWING = 12; // max swing of a hanging garment (degrees)

/* ---------- find where the garment really is inside its photo ---------- */
// Product photos have empty space around the clothes. We measure it once, so the
// hanger can sit exactly on the garment's shoulders.
const FALLBACK_BOX = { x0: 0.08, y0: 0.1, x1: 0.92, y1: 0.94, ratio: 1 };
const boxCache = new Map();

function measure(src) {
  if (boxCache.has(src)) return Promise.resolve(boxCache.get(src));
  return new Promise((resolve) => {
    const done = (box) => {
      boxCache.set(src, box);
      resolve(box);
    };
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const ratio = img.naturalWidth / img.naturalHeight;
        const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        const d = frame.data;

        const white = (i) => d[i + 3] > 200 && d[i] > 238 && d[i + 1] > 238 && d[i + 2] > 238;
        const px = (x, y) => (y * w + x) * 4;

        // photo with a solid white background (like a JPG)? make that part see-through
        let cleaned = false;
        if ([px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)].every(white)) {
          const seen = new Uint8Array(w * h);
          const stack = [];
          const push = (x, y) => {
            if (x < 0 || y < 0 || x >= w || y >= h) return;
            const k = y * w + x;
            if (seen[k] || !white(k * 4)) return;
            seen[k] = 1;
            stack.push(k);
          };
          for (let x = 0; x < w; x++) {
            push(x, 0);
            push(x, h - 1);
          }
          for (let y = 0; y < h; y++) {
            push(0, y);
            push(w - 1, y);
          }
          while (stack.length) {
            const k = stack.pop();
            d[k * 4 + 3] = 0;
            const x = k % w;
            const y = (k - x) / w;
            push(x + 1, y);
            push(x - 1, y);
            push(x, y + 1);
            push(x, y - 1);
          }
          ctx.putImageData(frame, 0, 0);
          cleaned = true;
        }

        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (d[(y * w + x) * 4 + 3] >= 24) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        const clean = cleaned ? canvas.toDataURL("image/png") : null;
        if (x1 <= x0 || y1 <= y0) return done({ ...FALLBACK_BOX, ratio, src: clean });
        done({ x0: x0 / w, y0: y0 / h, x1: (x1 + 1) / w, y1: (y1 + 1) / h, ratio, src: clean });
      } catch {
        done(FALLBACK_BOX); // image host doesn't allow reading pixels
      }
    };
    img.onerror = () => done(FALLBACK_BOX);
    img.src = src;
  });
}

function Hanger({ width }) {
  return (
    <svg className="rack-hanger" viewBox="0 0 100 30" style={{ width }} aria-hidden="true">
      <path d="M50 1.5c5.5 0 8 3 8 6.5 0 4-8 4.5-8 10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M50 18L4 27q-2 1 1 1.6h90q3-.6 1-1.6z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

/* One hanging piece: hanger + garment cropped to its own edges */
function Garment({ item, maxW, maxH }) {
  const upload = item.type === "upload";
  const [box, setBox] = useState(() => boxCache.get(item.image) || null);

  useEffect(() => {
    if (upload || box) return undefined;
    let alive = true;
    measure(item.image).then((b) => alive && setBox(b));
    return () => {
      alive = false;
    };
  }, [item.image, upload, box]);

  if (upload) {
    const w = maxW;
    return (
      <>
        <Hanger width={w + 16} />
        <span className="rack-photo" style={{ width: w, height: (w * 4) / 3 }}>
          <img src={item.image} alt={item.title} draggable="false" />
          <em>Yours</em>
        </span>
      </>
    );
  }

  const b = box || FALLBACK_BOX;
  const bw = b.x1 - b.x0;
  const bh = b.y1 - b.y0;
  const aspect = (bw * b.ratio) / bh; // width / height of the cropped garment
  let w = Math.min(maxH * aspect, maxW);
  const h = w / aspect;
  w = Math.round(w);

  return (
    <>
      <Hanger width={w + 18} />
      <span className="rack-garment" style={{ width: w, height: h, opacity: box ? 1 : 0 }}>
        <img
          src={b.src || item.image}
          alt={item.title}
          draggable="false"
          style={{ width: `${100 / bw}%`, left: `${(-b.x0 / bw) * 100}%`, top: `${(-b.y0 / bh) * 100}%` }}
        />
      </span>
    </>
  );
}

function ClothingRack({ items, onUpload, onRemove }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stageRef = useRef(null);
  const fileRef = useRef(null);
  const elRefs = useRef([]);
  const xs = useRef([]);
  const swing = useRef([]);
  const focusRef = useRef(-1);
  const m = useRef({ off: 0, speed: IDLE_SPEED, target: IDLE_SPEED, drag: false, lastX: 0, moved: false, snapTo: null });

  const [width, setWidth] = useState(1200);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const itemW = Math.min(Math.max(width * 0.17, 140), 210); // widest a garment can be
  const itemH = itemW * 1.45; // tallest a garment can be
  const S = itemW * 1.12; // space for each hanger

  // repeat the items so the rack always looks full and loops forever
  const list = useMemo(() => {
    if (!items.length) return [];
    const copies = Math.max(1, Math.ceil((width + 2 * S) / (items.length * S)));
    return Array.from({ length: copies }).flatMap((_, k) => items.map((it) => ({ ...it, key: `${it.id}-${k}` })));
  }, [items, width, S]);

  const isFav = useSelector((state) => state.favorites.some((f) => f.id === list[focus]?.id));

  // animation loop
  useEffect(() => {
    if (!list.length) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = list.length * S;
    let raf;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 16.7, 3) || 1;
      last = now;
      const s = m.current;

      if (s.snapTo !== null) {
        const diff = s.snapTo - s.off;
        s.off += diff * Math.min(0.14 * dt, 1);
        s.speed = 0;
        if (Math.abs(diff) < 0.4) {
          s.off = s.snapTo;
          s.snapTo = null;
          s.speed = IDLE_SPEED;
        }
      } else {
        if (s.drag) s.speed *= 0.9;
        else s.speed += (s.target - s.speed) * 0.04 * dt;
        if (reduce) s.speed = 0;
        s.off += s.speed * dt;
      }

      let best = 0;
      let bestDist = Infinity;
      list.forEach((_, i) => {
        const el = elRefs.current[i];
        if (!el) return;
        const x = ((((i * S + s.off) % total) + total) % total) - S;
        xs.current[i] = x;
        const dist = Math.abs(x + S / 2 - width / 2);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
        const d = Math.min(dist / width, 1);

        const sw = (swing.current[i] ||= { a: 0, v: 0 });
        const idle = reduce ? 0 : Math.sin(now / 900 + i * 1.3) * 1.8;
        const goal = Math.max(-MAX_SWING, Math.min(MAX_SWING, -s.speed * 2)) + idle;
        sw.v += (goal - sw.a) * 0.06 * dt;
        sw.v *= Math.pow(0.92, dt);
        sw.a += sw.v * dt;

        el.style.transform = `translate(${x}px, 0) rotate(${sw.a}deg) scale(${1 - d * 0.22})`;
        el.style.opacity = String(1 - Math.min(d * 1.1, 0.6));
        el.style.zIndex = String(Math.round(20 - d * 20));
      });

      if (best !== focusRef.current) {
        focusRef.current = best;
        setFocus(best);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [list, S, width]);

  // cursor + touch controls
  const onMove = (e) => {
    const s = m.current;
    if (s.drag) {
      const dx = e.clientX - s.lastX;
      if (Math.abs(dx) > 2) s.moved = true;
      s.off += dx;
      s.speed = dx * 0.8;
      s.snapTo = null;
      s.lastX = e.clientX;
      return;
    }
    if (e.pointerType !== "mouse") return;
    const rect = stageRef.current.getBoundingClientRect();
    const d = (e.clientX - rect.left) / rect.width - 0.5;
    s.target = Math.abs(d) < DEADZONE ? IDLE_SPEED : d * 2 * MAX_SPEED;
  };
  const onDown = (e) => {
    if (e.target.closest(".rack-arrow")) return;
    m.current.drag = true;
    m.current.moved = false;
    m.current.lastX = e.clientX;
  };
  useEffect(() => {
    const up = () => (m.current.drag = false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  // bring a piece to the middle
  const centerOn = (i) => {
    const s = m.current;
    s.snapTo = s.off + (width / 2 - (xs.current[i] + S / 2));
  };
  const step = (dir) => {
    const s = m.current;
    const i = Math.max(focusRef.current, 0);
    s.snapTo = s.off + (width / 2 - (xs.current[i] + S / 2)) - dir * S;
  };

  const picked = list[focus];

  return (
    <section
      className="rack"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      <div className="rack-head">
        <span className="eyebrow">New in</span>
        <h2>
          Browse the <em>rack</em>.
        </h2>
        <p>Move your cursor to steer it, or use the arrows. The piece in the light shows its details.</p>
      </div>

      <div
        className="rack-stage"
        ref={stageRef}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerLeave={() => (m.current.target = IDLE_SPEED)}
      >
        <div className="rack-cone" />
        <div className="rack-rod" style={{ left: "5%" }} />
        <div className="rack-rod" style={{ right: "5%" }} />
        <div className="rack-rail" />

        {list.map((it, i) => (
          <button
            key={it.key}
            ref={(el) => (elRefs.current[i] = el)}
            className="rack-item"
            style={{ width: S }}
            tabIndex={-1}
            aria-label={it.title}
            onClick={() => {
              if (!m.current.moved) centerOn(i);
            }}
          >
            <Garment item={it} maxW={itemW} maxH={itemH} />
          </button>
        ))}

        <button className="rack-arrow prev" aria-label="Previous piece" onClick={() => step(-1)}>‹</button>
        <button className="rack-arrow next" aria-label="Next piece" onClick={() => step(1)}>›</button>
      </div>

      <div className="rack-details" aria-live="polite">
        {picked ? (
          <>
            <div>
              <h3>{picked.title}</h3>
              {picked.price != null ? <span>${picked.price}</span> : <span>From your wardrobe</span>}
            </div>

            <div className="rack-actions">
              {picked.type === "upload" ? (
                <button className="btn ghost" onClick={() => onRemove?.(picked.id)}>Remove from rack</button>
              ) : (
                <>
                  <button
                    className={`btn ghost rack-heart ${isFav ? "on" : ""}`}
                    aria-pressed={isFav}
                    onClick={() =>
                      dispatch(
                        toggleFavorite({
                          id: picked.id,
                          title: picked.title,
                          price: picked.price,
                          thumbnail: picked.image,
                          category: picked.category,
                        })
                      )
                    }
                  >
                    {isFav ? "♥ Saved" : "♡ Save"}
                  </button>
                  <button className="btn" onClick={() => navigate(`/products/${picked.id}`)}>View product</button>
                </>
              )}
            </div>
          </>
        ) : (
          <span>Loading the rack…</span>
        )}
      </div>

      <div className="rack-upload">
        <button className="text-link" onClick={() => fileRef.current.click()}>Add your own clothes</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload?.(file);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

export default ClothingRack;