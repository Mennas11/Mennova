import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClothingRail.css";

// ---- tweak the feel here ----
const IDLE_SPEED = 0.25; // how fast the rail drifts on its own
const MAX_SPEED = 5; // top speed when the mouse is near the edge
const DEADZONE = 0.1; // middle zone where the mouse does nothing
const MAX_SWING = 14; // max swing angle of a garment (degrees)

export default function ClothingRail({ items, onUpload, onRemove }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const fileRef = useRef(null);
  const elRefs = useRef([]);
  const swing = useRef([]);
  const selectedKey = useRef(null);
  const motion = useRef({
    off: 0,
    speed: IDLE_SPEED,
    target: IDLE_SPEED,
    drag: false,
    lastX: 0,
    moved: false,
  });

  const [width, setWidth] = useState(1200);
  const [selected, setSelected] = useState(null);

  // measure container
  useEffect(() => {
    const el = heroRef.current;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const itemW = Math.min(Math.max(width * 0.16, 120), 180);
  const S = itemW * 1.3; // spacing between hangers

  // repeat items so the rail always looks full and loops forever
  const list = useMemo(() => {
    if (!items.length) return [];
    const copies = Math.max(1, Math.ceil((width + 2 * S) / (items.length * S)));
    return Array.from({ length: copies }).flatMap((_, k) =>
      items.map((it) => ({ ...it, key: `${it.id}-${k}` }))
    );
  }, [items, width, S]);

  // animation loop
  useEffect(() => {
    if (!list.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = list.length * S;
    let raf;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 16.7, 3) || 1;
      last = now;
      const m = motion.current;

      if (m.drag) m.speed *= 0.9;
      else m.speed += (m.target - m.speed) * 0.04 * dt;
      if (reduce) m.speed = 0;
      m.off += m.speed * dt;

      list.forEach((it, i) => {
        const el = elRefs.current[i];
        if (!el) return;
        const x = ((((i * S + m.off) % total) + total) % total) - S;
        const dx = (x + S / 2 - width / 2) / width;
        const scale = 1 - Math.min(Math.abs(dx), 1) * 0.18;

        const s = (swing.current[i] ||= { a: 0, v: 0 });
        const idle = reduce ? 0 : Math.sin(now / 900 + i * 1.3) * 2;
        const goal = Math.max(-MAX_SWING, Math.min(MAX_SWING, -m.speed * 2.2)) + idle;
        s.v += (goal - s.a) * 0.06 * dt;
        s.v *= Math.pow(0.92, dt);
        s.a += s.v * dt;

        const picked = selectedKey.current === it.key;
        el.style.transform = `translate(${x}px, ${picked ? -14 : 0}px) rotate(${s.a}deg) scale(${scale * (picked ? 1.08 : 1)})`;
        el.style.zIndex = Math.round(10 - Math.abs(dx) * 10);
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [list, S, width]);

  // pointer controls
  const onMove = (e) => {
    const m = motion.current;
    if (m.drag) {
      const dx = e.clientX - m.lastX;
      if (Math.abs(dx) > 2) m.moved = true;
      m.off += dx;
      m.speed = dx * 0.8;
      m.lastX = e.clientX;
      return;
    }
    if (e.pointerType !== "mouse") return;
    const rect = heroRef.current.getBoundingClientRect();
    const d = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    m.target = Math.abs(d) < DEADZONE ? IDLE_SPEED : d * 2 * MAX_SPEED;
  };
  const onDown = (e) => {
    const m = motion.current;
    m.drag = true;
    m.moved = false;
    m.lastX = e.clientX;
  };
  const onUp = () => (motion.current.drag = false);
  const onLeave = () => (motion.current.target = IDLE_SPEED);

  const pick = (it) => {
    if (motion.current.moved) return; // it was a drag, not a click
    selectedKey.current = it.key;
    setSelected(it);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload?.(file);
    e.target.value = "";
  };

  return (
    <section
      className="rail-hero"
      ref={heroRef}
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onLeave}
    >
      <div className="rail-stage">
      <div className="rail-bar" />

      {list.map((it, i) => (
        <button
          key={it.key}
          ref={(el) => (elRefs.current[i] = el)}
          className="rail-item"
          style={{ width: itemW }}
          onClick={() => pick(it)}
          aria-label={it.title}
        >
          <svg className="rail-hanger" viewBox="0 0 100 40" aria-hidden="true">
            <path d="M50 2c6 0 9 4 9 8 0 5-9 6-9 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 22L6 36h88z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <span className="rail-photo">
            <img src={it.image} alt={it.title} draggable="false" />
            {it.type === "upload" && <em>Yours</em>}
          </span>
        </button>
      ))}
      </div>

      <div className="rail-footer">
      <div className="rail-copy">
        <h1>
          Browse the rack,
          <br />
          like in store.
        </h1>
        <p>Move your mouse to steer it. Click a piece to see it.</p>
        <button
          type="button"
          className="rail-upload"
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current.click();
          }}
        >
          + Add your own clothes
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>

      <div className={`rail-tag ${selected ? "on" : ""}`}>
        {selected ? (
          <>
            <h3>{selected.title}</h3>
            {selected.price != null && <span>${selected.price}</span>}
            {selected.type === "upload" ? (
              <button
                onClick={() => {
                  onRemove?.(selected.id);
                  selectedKey.current = null;
                  setSelected(null);
                }}
              >
                Remove from rack
              </button>
            ) : (
              <button onClick={() => navigate(`/products/${selected.id}`)}>View product</button>
            )}
          </>
        ) : (
          <span>Select a piece</span>
        )}
      </div>
      </div>
    </section>
  );
}