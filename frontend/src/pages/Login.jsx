
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { login } from "../services/authService";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập!");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }

    setLoading(true);

    const result = login(username, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    onLogin();
    navigate("/", { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Logo */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <GraduationCap size={34} strokeWidth={2.3} />
          </div>

          <h1>Smart Class</h1>
          <p>Smart Classroom IoT Monitoring System</p>
        </div>

        {/* Form */}
        <div className="login-card">
          <div className="login-heading">
            <h2>Welcome Back!</h2>

            <p>
              Sign in to access your Smart Classroom dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="login-field">
              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">
                <UserRound size={20} />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  autoComplete="username"
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole size={20} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />

                <button
                  type="button"
                  className="show-password-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading ? "Signing in..." : "Sign In"}
              </span>

              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <p className="login-copyright">
          © 2026 Smart Class IoT System
        </p>
      </div>
    </div>
  );
}
