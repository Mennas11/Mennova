// Member coupons. The backend will validate these later (expiry, usage limits).
const COUPONS = {
  MENNOVA20: { rate: 0.2, label: "Member discount, 20% off" },
  STYLE25: {
    rate: 0.25,
    label: "Style quiz reward, 25% off",
    needsQuiz: true,
  },
};

export function checkCoupon(rawCode, { isMember, quizDone }) {
  const code = rawCode.trim().toUpperCase();
  const coupon = COUPONS[code];

  if (!coupon) return { ok: false, message: "This code isn't valid." };
  if (!isMember) return { ok: false, message: "Log in to use member coupons." };
  if (coupon.needsQuiz && !quizDone) {
    return { ok: false, message: "Finish the style quiz to unlock this code." };
  }

  return { ok: true, code, rate: coupon.rate, message: coupon.label };
}