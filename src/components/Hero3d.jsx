import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";

// ---- tweak the feel here ----
const AUTO_SPEED = 0.006; // how fast it spins on its own
const RESUME_AFTER_MS = 3000; // pause after you let go, then it spins again
const MAX_PITCH = 0.3; // how far you can tilt up/down (radians, about 17 degrees)

const ITEMS = {
  Dress: {
    label: "Satin dress",
    cam: [2.3, 10, 1.6], // camera y, z, look-at y
    cols: [
      ["Rose", "#ff4d8d"],
      ["Burgundy", "#7a2e3f"],
      ["Emerald", "#0f7a5c"],
      ["Champagne", "#d9b27c"],
    ],
  },
  Bag: {
    label: "Leather bag",
    cam: [1.9, 7.4, 1.15],
    cols: [
      ["Camel", "#b98a58"],
      ["Burgundy", "#7a2e3f"],
      ["Rose", "#f3b8c9"],
      ["Noir", "#2a2630"],
    ],
  },
};

/* A tiny photo studio drawn on a canvas. It gives the glossy reflections. */
function makeEnv(pmrem, light) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  if (light) {
    gr.addColorStop(0, "#fff6ec");
    gr.addColorStop(0.5, "#e9dccd");
    gr.addColorStop(1, "#cdb9a6");
  } else {
    gr.addColorStop(0, "#3a2029");
    gr.addColorStop(0.5, "#1a0f14");
    gr.addColorStop(1, "#35202b");
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#fff";
  [[60, 20, 50, 160], [220, 30, 30, 140], [380, 20, 60, 170]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
  g.fillStyle = "#ff4d8d";
  g.fillRect(300, 40, 18, 120);
  g.fillStyle = "#d9b27c";
  g.fillRect(450, 50, 20, 110);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  return env;
}

/* Tries a few WebGL settings (some PCs only allow the simpler ones). */
function createRenderer(stage) {
  const attempts = [
    { antialias: true, alpha: true },
    { antialias: false, alpha: true },
    { antialias: false, alpha: true, powerPreference: "low-power" },
  ];
  let lastError;
  for (const opts of attempts) {
    const canvas = document.createElement("canvas");
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, ...opts });
      return { renderer, canvas };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function roundedRect(w, h, q) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + q, y);
  s.lineTo(x + w - q, y);
  s.quadraticCurveTo(x + w, y, x + w, y + q);
  s.lineTo(x + w, y + h - q);
  s.quadraticCurveTo(x + w, y + h, x + w - q, y + h);
  s.lineTo(x + q, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - q);
  s.lineTo(x, y + q);
  s.quadraticCurveTo(x, y, x + q, y);
  return s;
}

const extrude = (w, h, q, depth, bevel) =>
  new THREE.ExtrudeGeometry(roundedRect(w, h, q), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 18,
  });

const smooth = (pts) =>
  new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(80);

function Hero3D({ defaultDress = "#7a2e3f" }) {
  const mode = useSelector((state) => state.theme.mode);

  const [item, setItem] = useState("Dress");
  const [colors, setColors] = useState({ Dress: defaultDress, Bag: "#b98a58" });
  const [hinted, setHinted] = useState(false);
  const [failed, setFailed] = useState(""); // empty = fine, otherwise the error text

  const stageRef = useRef(null);
  const api = useRef(null);
  const live = useRef({ item, colors, mode }); // latest values for the animation loop
  live.current = { item, colors, mode };

  // ---- build the scene once ----
  useEffect(() => {
    const stage = stageRef.current;
    setFailed("");

    // a fresh canvas every time (React StrictMode mounts this effect twice in dev,
    // and a canvas whose WebGL context was already closed can't be reused)
    let renderer;
    let canvas;
    try {
      ({ renderer, canvas } = createRenderer(stage));
    } catch (err) {
      console.error("Hero3D could not start WebGL:", err);
      setFailed(String(err?.message || err));
      return undefined;
    }
    canvas.setAttribute("aria-label", "3D fashion piece you can turn and recolor");
    stage.prepend(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const ENV = { dark: makeEnv(pmrem, false), light: makeEnv(pmrem, true) };

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const key = new THREE.DirectionalLight(0xfff0e0, 1.4);
    key.position.set(4, 6, 6);
    const rim = new THREE.DirectionalLight(0xff4d8d, 1.6);
    rim.position.set(-5, 3, 3);
    scene.add(ambient, key, rim);

    const gold = new THREE.MeshStandardMaterial({ color: 0xd9b27c, metalness: 1, roughness: 0.22, envMapIntensity: 1.5 });
    const root = new THREE.Group();
    root.rotation.order = "YXZ";
    scene.add(root);

    const pedMat = new THREE.MeshStandardMaterial({ color: 0x2a1820, roughness: 0.25, metalness: 0.6 });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.14, 64), pedMat);
    pedestal.position.y = -0.07;
    scene.add(pedestal);

    /* ---- satin dress on a dress form, with soft pleats ---- */
    const dressGroup = new THREE.Group();
    const dressMat = new THREE.MeshPhysicalMaterial({
      color: live.current.colors.Dress,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      envMapIntensity: 1.7,
      side: THREE.DoubleSide,
    });
    const formMat = new THREE.MeshStandardMaterial({ color: 0xe9dfcf, roughness: 0.8 });

    const form = new THREE.Mesh(
      new THREE.LatheGeometry(smooth([[0.5, 1.0], [0.62, 1.35], [0.3, 1.85], [0.55, 2.3], [0.45, 2.62], [0.17, 2.8]]), 64),
      formMat
    );
    form.scale.z = 0.72;

    const dressGeo = new THREE.LatheGeometry(
      smooth([[0.47, 2.6], [0.59, 2.3], [0.34, 1.85], [0.69, 1.4], [0.92, 0.95], [1.18, 0.55], [1.3, 0.3]]),
      180
    );
    const pos = dressGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const w = Math.max(0, Math.min(1, (1.7 - y) / 0.8)); // pleats only on the skirt
      const f = 1 + 0.04 * w * Math.sin(Math.atan2(z, x) * 10 + y * 2);
      pos.setX(i, x * f);
      pos.setZ(i, z * f);
    }
    pos.needsUpdate = true;
    dressGeo.computeVertexNormals();

    const dress = new THREE.Mesh(dressGeo, dressMat);
    dress.scale.z = 0.72;
    const neck = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), formMat);
    neck.position.y = 2.86;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 16), gold);
    pole.position.y = 0.55;
    dressGroup.add(form, dress, neck, pole);
    root.add(dressGroup);

    /* ---- structured leather bag with gold hardware ---- */
    const bagGroup = new THREE.Group();
    const leather = new THREE.MeshPhysicalMaterial({
      color: live.current.colors.Bag,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1.2,
    });
    const body = new THREE.Mesh(extrude(2.4, 1.6, 0.25, 0.8, 0.14), leather);
    body.position.set(0, 1.0, -0.4);
    const flap = new THREE.Mesh(extrude(2.5, 0.9, 0.2, 0.05, 0.05), leather);
    flap.position.set(0, 1.5, 0.62);
    const clasp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 32), gold);
    clasp.rotation.x = Math.PI / 2;
    clasp.position.set(0, 1.18, 0.74);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.07, 16, 48, Math.PI), leather);
    handle.position.set(0, 1.82, 0);
    const ringL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24), gold);
    const ringR = ringL.clone();
    ringL.position.set(-0.75, 1.82, 0);
    ringR.position.set(0.75, 1.82, 0);
    bagGroup.add(body, flap, clasp, handle, ringL, ringR);
    bagGroup.scale.setScalar(1.1);
    bagGroup.rotation.y = 0.35;
    root.add(bagGroup);

    /* ---- what React tells the scene ---- */
    api.current = {
      apply() {
        const { item: it, colors: cols } = live.current;
        dressGroup.visible = it === "Dress";
        bagGroup.visible = it === "Bag";
        dressMat.color.set(cols.Dress);
        leather.color.set(cols.Bag);
      },
      theme(m) {
        scene.environment = ENV[m];
        pedMat.color.set(m === "dark" ? 0x2a1820 : 0xd8c7b6);
        ambient.intensity = m === "dark" ? 0.7 : 1.1;
        rim.intensity = m === "dark" ? 1.6 : 0.9;
      },
    };
    api.current.apply();
    api.current.theme(live.current.mode);

    /* ---- drag to turn; spins on its own when left alone ---- */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ry = 0;
    let pitch = 0;
    let speed = 0;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let lastTouch = -Infinity;
    let hintShown = false;
    const cam = { y: 2.3, z: 10, look: 1.6 };

    const touched = () => {
      lastTouch = performance.now();
      if (!hintShown) {
        hintShown = true;
        setHinted(true);
      }
    };
    const down = (e) => {
      if (e.target.closest(".h-ui")) return; // let the Dress/Bag and color buttons work
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = "grabbing";
    };
    const move = (e) => {
      if (!dragging) return;
      ry += (e.clientX - lx) * 0.01;
      pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch + (e.clientY - ly) * 0.004));
      lx = e.clientX;
      ly = e.clientY;
      touched();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = "grab";
      lastTouch = performance.now();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((n) => stage.addEventListener(n, up));

    let raf;
    const frame = (now) => {
      const [cy, cz, cl] = ITEMS[live.current.item].cam;
      cam.y += (cy - cam.y) * 0.06;
      cam.z += (cz - cam.z) * 0.06;
      cam.look += (cl - cam.look) * 0.06;
      camera.position.set(0, cam.y, cam.z);
      camera.lookAt(0, cam.look, 0);

      const idle = !dragging && now - lastTouch > RESUME_AFTER_MS;
      speed += ((idle && !reduce ? AUTO_SPEED : 0) - speed) * 0.03; // eases in and out
      ry += speed;
      if (idle) pitch += (0 - pitch) * 0.04; // levels out by itself

      root.rotation.set(pitch, ry, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((n) => stage.removeEventListener(n, up));
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      ENV.dark.dispose();
      ENV.light.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      api.current = null;
    };
  }, []);

  // ---- keep the scene in sync with React state ----
  useEffect(() => {
    api.current?.apply();
  }, [item, colors]);

  useEffect(() => {
    api.current?.theme(mode);
  }, [mode]);

  return (
    <div className="h-stage" ref={stageRef}>
      {failed && (
        <div className="h-fb">
          <svg viewBox="0 0 100 160" aria-hidden="true">
            <path d="M38 4h24l4 30 12 6-8 20 20 96H10L30 60 22 40l12-6z" />
          </svg>
          <p>
            3D is turned off in this browser. Turn on hardware acceleration in your browser
            settings and refresh.
          </p>
          {import.meta.env.DEV && <small>Details for you (only shown in development): {failed}</small>}
        </div>
      )}

      {!failed && <div className="h-name">{ITEMS[item].label}</div>}
      {!failed && <div className={`h-drag ${hinted ? "gone" : ""}`}>← Drag to turn →</div>}

      <div className="h-ui" hidden={Boolean(failed)}>
        <div className="h-seg">
          {Object.keys(ITEMS).map((name) => (
            <button key={name} aria-pressed={item === name} onClick={() => setItem(name)}>
              {name}
            </button>
          ))}
        </div>

        <div className="h-dots">
          {ITEMS[item].cols.map(([label, hex]) => (
            <button
              key={hex}
              className="h-dot"
              style={{ background: hex }}
              aria-label={label}
              aria-pressed={colors[item] === hex}
              onClick={() => setColors({ ...colors, [item]: hex })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero3D;