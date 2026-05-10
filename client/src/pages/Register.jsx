// /client/src/pages/Register.jsx

import { useState } from "react";
import { API_URL } from "../config/api.js";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../utils/validation";

/**
 * =========================================================
 * REGISTER PAGE
 * =========================================================
 *
 * PURPOSE:
 * Creates a new user account via backend API.
 *
 * FLOW:
 * 1. User submits email + password
 * 2. POST /api/auth/register
 * 3. Backend creates user
 * 4. User is redirected to login
 *
 * NOTE:
 * Registration does NOT log user in automatically
 * (consistent with explicit login flow design)
 * =========================================================
 */

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const passwordError = validatePassword(password);   // ← add here
    if (passwordError) {
      setIsSuccess(false);
      setMessage(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsSuccess(false);
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSuccess(false);
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setMessage("Registration successful. Please log in.");

      setTimeout(() => {
        navigate("/login");
      }, 800);

    } catch (err) {
      setIsSuccess(false);
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Trade<span className="text-emerald-400">Track</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Create your account</p>
        </div>

        {/* CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

          <form onSubmit={handleRegister} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* MESSAGE */}
            {message && (
              <p className={`text-sm rounded-lg px-4 py-2.5 border ${isSuccess
                  ? "text-emerald-400 bg-emerald-950 border-emerald-800"
                  : "text-red-400 bg-red-950 border-red-800"
                }`}>
                {message}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-lg px-4 py-2.5 text-sm transition"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              Sign In
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}