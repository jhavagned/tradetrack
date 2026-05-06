// /client/src/pages/Register.jsx

import { useState } from "react";
import { API_URL } from "../config/api.js";
import { useNavigate } from "react-router-dom";

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Registration successful. Please log in.");

      setTimeout(() => {
        navigate("/login");
      }, 800);

    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p>{message}</p>

      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}>
          Login
        </button>
      </p>
    </div>
  );
}