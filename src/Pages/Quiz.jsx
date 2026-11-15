import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { saveQuiz } from "../features/quiz/quizSlice";
import { resizeImage } from "../utils/resizeImage";

const TONES = [
  { id: "fair-cool", label: "Fair, cool", color: "#f1cfc4" },
  { id: "fair-warm", label: "Fair, warm", color: "#e8b98f" },
  { id: "medium-olive", label: "Medium, olive", color: "#c4895a" },
  { id: "tan", label: "Tan", color: "#a86b3e" },
  { id: "deep-warm", label: "Deep, warm", color: "#7a4528" },
  { id: "deep-cool", label: "Deep, cool", color: "#3e2418" },
];

const BODY_TYPES = {
  women: [
    { id: "hourglass", label: "Hourglass", hint: "Shoulders and hips balanced, defined waist" },
    { id: "pear", label: "Pear", hint: "Hips wider than shoulders" },
    { id: "apple", label: "Apple", hint: "Fuller midsection, slimmer legs" },
    { id: "rectangle", label: "Rectangle", hint: "Shoulders, waist and hips similar" },
    { id: "inverted-triangle", label: "Inverted triangle", hint: "Shoulders wider than hips" },
  ],
  men: [
    { id: "rectangle", label: "Rectangle", hint: "Shoulders, waist and hips similar" },
    { id: "trapezoid", label: "Trapezoid", hint: "Broad shoulders, narrower waist" },
    { id: "triangle", label: "Triangle", hint: "Hips wider than shoulders" },
    { id: "oval", label: "Oval", hint: "Fuller midsection" },
    { id: "inverted-triangle", label: "Inverted triangle", hint: "Very broad shoulders, slim waist" },
  ],
};

const STYLES = [
  { id: "simple", label: "Simple", hint: "Clean and easy" },
  { id: "royal", label: "Royal", hint: "Rich and elegant" },
  { id: "casual", label: "Casual", hint: "Comfortable every day" },
  { id: "streetwear", label: "Streetwear", hint: "Bold and relaxed" },
  { id: "classic", label: "Classic", hint: "Timeless pieces" },
  { id: "sporty", label: "Sporty", hint: "Active and fresh" },
];

const COLOR_PREFS = [
  { id: "colorful", label: "I love colors", hint: "Bright and bold" },
  { id: "neutral", label: "White and black", hint: "Neutral and clean" },
  { id: "both", label: "A bit of both", hint: "Neutral base, color accents" },
];

const FAVORITE_STYLES = ["minimal", "elegant", "street", "bohemian", "vintage", "sporty"];

const STEPS = ["gender", "tone", "body", "measure", "style", "colors", "favorite"];

const EMPTY = {
  gender: "",
  colorTone: "",
  bodyType: "",
  height: 165,
  weight: 60,
  stylePrefs: [],
  colorPref: "",
  favoriteStyle: "",
  inspirationImage: "",
};

function Quiz() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const saved = useSelector((state) => state.quiz.answers);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ ...EMPTY, ...(saved || {}) });
  const [imageError, setImageError] = useState("");

  const current = STEPS[step];
  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));

  // can the user continue from this step?
  const valid = {
    gender: Boolean(answers.gender),
    tone: Boolean(answers.colorTone),
    body: Boolean(answers.bodyType),
    measure: true,
    style: answers.stylePrefs.length > 0,
    colors: Boolean(answers.colorPref),
    favorite: Boolean(answers.favoriteStyle),
  }[current];

  function toggleStyle(id) {
    set({
      stylePrefs: answers.stylePrefs.includes(id)
        ? answers.stylePrefs.filter((s) => s !== id)
        : [...answers.stylePrefs, id],
    });
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    try {
      set({ inspirationImage: await resizeImage(file, 600) });
    } catch {
      setImageError("We couldn't read this image. Try a JPG or PNG.");
    }
  }

  function finish() {
    dispatch(saveQuiz({ email: user.email, answers }));
    navigate("/products?foryou=1");
  }

  const next = () => (step === STEPS.length - 1 ? finish() : setStep(step + 1));

  const Option = ({ item, selected, onClick }) => (
    <button
      type="button"
      className={`opt ${selected ? "on" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <b>{item.label}</b>
      {item.hint && <small>{item.hint}</small>}
    </button>
  );

  return (
    <section className="quiz-wrap">
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="step-count">Question {step + 1} of {STEPS.length}</p>

      {current === "gender" && (
        <>
          <h1 className="q-title">Who are we dressing?</h1>
          <p className="q-sub">This helps us show the right pieces.</p>
          <div className="options">
            <Option item={{ label: "Women" }} selected={answers.gender === "women"} onClick={() => set({ gender: "women", bodyType: "" })} />
            <Option item={{ label: "Men" }} selected={answers.gender === "men"} onClick={() => set({ gender: "men", bodyType: "" })} />
          </div>
        </>
      )}

      {current === "tone" && (
        <>
          <h1 className="q-title">What's your color tone?</h1>
          <p className="q-sub">Pick the circle closest to your skin. We'll match colors that make you glow.</p>
          <div className="tones">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tone ${answers.colorTone === t.id ? "on" : ""}`}
                aria-pressed={answers.colorTone === t.id}
                onClick={() => set({ colorTone: t.id })}
              >
                <i style={{ "--c": t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      {current === "body" && (
        <>
          <h1 className="q-title">What's your body type?</h1>
          <p className="q-sub">Pick the closest one. There's no wrong answer.</p>
          <div className="options">
            {BODY_TYPES[answers.gender || "women"].map((b) => (
              <Option key={b.id} item={b} selected={answers.bodyType === b.id} onClick={() => set({ bodyType: b.id })} />
            ))}
          </div>
        </>
      )}

      {current === "measure" && (
        <>
          <h1 className="q-title">Your height and weight</h1>
          <p className="q-sub">We use them to suggest sizes and fits.</p>
          <div className="range-row">
            <label htmlFor="height">Height <output>{answers.height} cm</output></label>
            <input id="height" type="range" min="140" max="210" value={answers.height} onChange={(e) => set({ height: Number(e.target.value) })} />
          </div>
          <div className="range-row">
            <label htmlFor="weight">Weight <output>{answers.weight} kg</output></label>
            <input id="weight" type="range" min="40" max="150" value={answers.weight} onChange={(e) => set({ weight: Number(e.target.value) })} />
          </div>
        </>
      )}

      {current === "style" && (
        <>
          <h1 className="q-title">Which looks do you like?</h1>
          <p className="q-sub">Choose as many as you want.</p>
          <div className="options">
            {STYLES.map((s) => (
              <Option key={s.id} item={s} selected={answers.stylePrefs.includes(s.id)} onClick={() => toggleStyle(s.id)} />
            ))}
          </div>
        </>
      )}

      {current === "colors" && (
        <>
          <h1 className="q-title">Colors or neutrals?</h1>
          <p className="q-sub">What do you reach for first in your wardrobe?</p>
          <div className="options">
            {COLOR_PREFS.map((c) => (
              <Option key={c.id} item={c} selected={answers.colorPref === c.id} onClick={() => set({ colorPref: c.id })} />
            ))}
          </div>
        </>
      )}

      {current === "favorite" && (
        <>
          <h1 className="q-title">Your favorite style</h1>
          <p className="q-sub">Pick one, and add a photo of an outfit you love if you have one.</p>
          <div className="tabs">
            {FAVORITE_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${answers.favoriteStyle === s ? "on" : ""}`}
                aria-pressed={answers.favoriteStyle === s}
                onClick={() => set({ favoriteStyle: s })}
                style={{ textTransform: "capitalize" }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="upload-box">
            {answers.inspirationImage ? (
              <img src={answers.inspirationImage} alt="Your inspiration outfit" />
            ) : (
              <span>Add a photo of your favorite outfit (optional)</span>
            )}
            <label className="btn ghost" style={{ cursor: "pointer" }}>
              {answers.inspirationImage ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" hidden onChange={handleImage} />
            </label>
            {imageError && <span style={{ color: "var(--pink)" }}>{imageError}</span>}
          </div>
        </>
      )}

      <div className="quiz-nav">
        <div>
          {step > 0 ? (
            <button className="link-btn" onClick={() => setStep(step - 1)}>Back</button>
          ) : (
            <button className="link-btn" onClick={() => navigate("/")}>Skip for now</button>
          )}
        </div>
        <button className="btn" disabled={!valid} onClick={next}>
          {step === STEPS.length - 1 ? "See my picks" : "Continue"}
        </button>
      </div>
    </section>
  );
}

export default Quiz;