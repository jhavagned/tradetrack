// /client/src/App.jsx

// =========================================================
// APP ROUTER (FRONTEND ENTRY ROUTES)
// =========================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TradeEntry from "./pages/TradeEntry";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";

import ProtectedRoute from "./routes/ProtectedRoute";

/**
 * =========================================================
 * APP COMPONENT
 * =========================================================
 *
 * PURPOSE:
 * Defines all frontend routes and separates public vs protected
 * application areas.
 *
 * =========================================================
 * ROUTE STRATEGY:
 *
 * PUBLIC ROUTES:
 * - /login     → user authentication
 * - /register  → user signup
 *
 * PROTECTED ROUTES:
 * - /trade     → trade entry dashboard (requires session)
 *
 * FALLBACK ROUTE:
 * - Any unknown route redirects to /login
 *
 * =========================================================
 * AUTH MODEL:
 * - Session-based authentication (httpOnly cookie)
 * - ProtectedRoute checks AuthContext state
 * - Backend is source of truth for session validity
 *
 * =========================================================
 * NOTES:
 * - This is a lightweight routing layer only
 * - No business logic should live here
 * - All auth enforcement happens in ProtectedRoute + backend
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
            ========================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================
            PROTECTED ROUTES
            ========================= */}
        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <TradeEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />

        {/* =========================
            FALLBACK ROUTE
            ========================= */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;