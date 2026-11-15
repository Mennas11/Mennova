import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { register } from "../features/auth/authSlice";
import { clearQuiz } from "../features/quiz/quizSlice";
import { createUser, findUser } from "../utils/users";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Your password needs at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }
    if (findUser(form.email)) {
      setError("This email already has an account. Try logging in.");
      return;
    }

    createUser(form);
    dispatch(clearQuiz());
    dispatch(register({ name: form.name.trim(), email: form.email.trim().toLowerCase() }));

    // new members go straight to the style quiz
    navigate("/quiz");
  };

  return (
    <section className="auth">
      <div className="auth-side">
        <h2>Style that speaks you.</h2>
        <p>Join Mennova, answer a few questions, and get outfits and a 25% coupon made for you.</p>
      </div>

      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Create account</h1>
          <p className="sub">It takes less than a minute.</p>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={update("name")} required autoComplete="name" />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} required autoComplete="email" />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={update("password")}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn full">Create account</button>

          <p className="alt">
            Already a member? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Register;