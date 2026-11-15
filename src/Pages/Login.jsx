import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../features/auth/authSlice";
import { loadQuiz } from "../features/quiz/quizSlice";
import { findUser } from "../utils/users";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = findUser(email);

    if (!user || user.password !== password) {
      setError("Email or password is wrong. If you're new, create an account first.");
      return;
    }

    dispatch(login({ name: user.name, email: user.email }));
    dispatch(loadQuiz(user.email));
    navigate("/");
  };

  return (
    <section className="auth">
      <div className="auth-side">
        <h2>Welcome back.</h2>
        <p>Your favorites, your bag and your style profile are waiting.</p>
      </div>

      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Log in</h1>
          <p className="sub">Good to see you again.</p>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn full">Log in</button>

          <p className="alt">
            New to Mennova? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;