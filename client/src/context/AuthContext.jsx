// /client/src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext();

/**
 * =========================================================
 * AUTH CONTEXT PROVIDER
 * =========================================================
 *
 * PURPOSE:
 * Centralized authentication state manager for the frontend.
 *
 * =========================================================
 * RESPONSIBILITIES:
 * - Hydrate session on app load (/api/auth/me)
 * - Maintain global auth state
 * - Provide login/logout actions
 * - Expose single source of truth for session validity
 *
 * =========================================================
 * AUTH STRATEGY:
 * - Cookie-based session (httpOnly sessionId)
 * - Backend is source of truth
 * - Frontend only mirrors session state
 *
 * =========================================================
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * =========================================================
   * CHECK AUTH (SOURCE OF TRUTH)
   * =========================================================
   *
   * Calls backend session endpoint.
   * If session is invalid or expired:
   * → clears frontend auth state
   */
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      const data = await res.json();

      setUser(data.data?.userId ? data.data : null);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);
  // const checkAuth = async () => {
  //   try {
  //     const res = await fetch(`${API_URL}/api/auth/me`, {
  //       credentials: "include",
  //     });

  //     if (!res.ok) {
  //       setUser(null);
  //       setIsAuthenticated(false);
  //       return false;
  //     }

  //     const data = await res.json();

  //     setUser(data.user);
  //     setIsAuthenticated(true);
  //     return true;
  //   } catch (err) {
  //     setUser(null);
  //     setIsAuthenticated(false);
  //     return false;
  //   }
  // };

  /**
   * =========================================================
   * INITIAL AUTH HYDRATION
   * =========================================================
   */
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setLoading(false);
    };

    init();
  }, [checkAuth]);

  /**
   * =========================================================
   * PERIODIC SESSION VALIDATION
   * THIS is what makes TTL "feel real"
   * =========================================================
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth();
    }, 60 * 1000); // 1 min check (not 5 min)

    return () => clearInterval(interval);
  }, [checkAuth]);

  /**
   * =========================================================
   * LOGIN
   * =========================================================
   *
   * NOTE:
   * We do NOT blindly trust this.
   * Prefer calling checkAuth() after login API success.
   */
  const login = async () => {
    await checkAuth();
  };
  // const login = (userData) => {
  //   setUser(userData);
  //   setIsAuthenticated(true);
  // };

  /**
   * =========================================================
   * LOGOUT
   * =========================================================
   *
   * - Calls backend to destroy session
   * - Clears frontend state
   */
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,

        // actions
        login,
        logout,

        // Exposed for route guards
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for cleaner usage
export const useAuth = () => useContext(AuthContext);