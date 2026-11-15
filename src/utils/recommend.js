// Simple scoring: every quiz answer gives points to matching products.
// dummyjson has no style tags, so we match words in the title/description.
// With your own MongoDB products you'll add real `styles`, `colors` and `bodyTypes` fields.

const STYLE_WORDS = {
  simple: ["shirt", "top", "tee", "basic", "cotton", "plain", "casual"],
  royal: ["dress", "gown", "evening", "silk", "velvet", "gold", "heel", "luxury", "elegant"],
  casual: ["casual", "cotton", "comfort", "sneaker", "tee", "denim"],
  streetwear: ["sneaker", "sport", "street", "oversized", "bold"],
  classic: ["classic", "formal", "leather", "elegant", "timeless", "shirt"],
  sporty: ["sport", "running", "athletic", "sneaker", "training"],
  minimal: ["minimal", "plain", "simple", "basic"],
  elegant: ["elegant", "silk", "dress", "heel", "evening"],
  street: ["sneaker", "street", "sport", "bold"],
  bohemian: ["floral", "boho", "flowy", "summer"],
  vintage: ["vintage", "retro", "classic", "leather"],
};

const NEUTRAL = ["black", "white", "grey", "gray", "beige", "cream", "navy", "neutral"];
const COLORFUL = ["red", "pink", "blue", "green", "yellow", "orange", "purple", "floral", "bright", "colorful"];

function textOf(p) {
  return `${p.title} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase();
}

export function scoreProduct(p, a) {
  const text = textOf(p);
  let score = 0;

  // gender
  if (a.gender) {
    if (p.gender === a.gender) score += 5;
    else if (p.gender === "unisex") score += 2;
    else score -= 6;
  }

  // style preferences + favorite style
  [...(a.stylePrefs || []), a.favoriteStyle].forEach((style) => {
    (STYLE_WORDS[style] || []).forEach((word) => {
      if (text.includes(word)) score += 1;
    });
  });

  // color preference
  const words = a.colorPref === "neutral" ? NEUTRAL : a.colorPref === "colorful" ? COLORFUL : [];
  words.forEach((w) => {
    if (text.includes(w)) score += 1.5;
  });

  // quality tie-breaker
  score += (p.rating || 0) / 5;

  return score;
}

export function rankProducts(products, answers) {
  return products
    .map((p) => ({ ...p, score: scoreProduct(p, answers) }))
    .sort((x, y) => y.score - x.score);
}