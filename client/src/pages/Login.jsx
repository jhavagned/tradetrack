// /client/src/pages/Login.jsx

import { useState } from "react";
import { API_URL } from "../config/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * =========================================================
 * LOGIN PAGE
 * =========================================================
 *
 * PURPOSE:
 * Handles user authentication via backend session.
 *
 * =========================================================
 * FLOW:
 * 1. User submits credentials
 * 2. POST /api/auth/login
 * 3. Backend sets httpOnly session cookie
 * 4. Frontend calls checkAuth() to hydrate user
 * 5. Redirect to protected route
 *
 * =========================================================
 * IMPORTANT:
 * - Frontend does NOT store tokens
 * - Backend session is the source of truth
 * - checkAuth() ensures consistency
 */

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    //const { checkAuth } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Login failed");
                setLoading(false);
                return;
            }

            await login();
            //await checkAuth();

            setMessage("Login successful");

            navigate("/trade");
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setMessage(err.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>
            </form>

            <p>{message}</p>

            <p>
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")}>
                    Register
                </button>
            </p>
        </div>
    );
}