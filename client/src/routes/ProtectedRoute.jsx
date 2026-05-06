// /client/src/routes/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * =========================================================
 * PROTECTED ROUTE
 * =========================================================
 *
 * PURPOSE:
 * Guards routes that require authentication.
 *
 * FLOW:
 * 1. Wait for AuthContext hydration
 * 2. If loading → show neutral state (prevents flicker)
 * 3. If not authenticated → redirect to login
 * 4. If authenticated → render route
 *
 * IMPORTANT:
 * Prevents "refresh → login flash → redirect bug"
 * =========================================================
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  /**
   * 1. WAIT FOR AUTH HYDRATION
   * Prevents false redirects on page refresh
   */
  if (loading) {
    return <div>Loading...</div>; // or spinner
  }
  /**
   * 2. REDIRECT IF NOT AUTHENTICATED
   * Preserve attempted route for future redirect
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. ALLOW access
  return children;
}
const styles = {
  loading: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
    fontSize: "14px",
    color: "#666",
  },
};