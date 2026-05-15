// /client/src/pages/Login.jsx

import { useState } from "react";
import { API_URL } from "../config/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../utils/validation";

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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const passwordError = validatePassword(password);   // ← add here
        if (passwordError) {
            setMessage(passwordError);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error?.message || "Login failed");
                setLoading(false);
                return;
            }

            await login();

            setMessage("Login successful");

            navigate("/dashboard");
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setMessage(err.message || "Network error");
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
                    <p className="mt-2 text-sm text-zinc-500">Sign in to your account</p>
                </div>

                {/* CARD */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

                    <form onSubmit={handleLogin} className="space-y-5">

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

                        {/* ERROR MESSAGE */}
                        {message && (
                            <p className={`text-sm rounded-lg px-4 py-2.5 border ${message === "Login successful"
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
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    {/* REGISTER LINK */}
                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <button
                            onClick={() => navigate("/register")}
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition"
                        >
                            Register
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
}