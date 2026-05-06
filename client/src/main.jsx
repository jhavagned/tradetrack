// =========================================================
// APPLICATION ENTRY POINT
// =========================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

/**
 * =========================================================
 * PURPOSE
 * =========================================================
 * Bootstraps the React application and mounts it to the DOM.
 *
 * This file defines the global provider hierarchy:
 *
 * - StrictMode: React dev tooling for detecting side effects
 * - AuthProvider: global authentication state (session-based)
 * - App: application routing + UI structure
 *
 * =========================================================
 * PROVIDER ARCHITECTURE
 * =========================================================
 *
 * The app is wrapped in AuthProvider so that:
 * - Any component can access auth state
 * - Session hydration happens once on app load
 * - Login/logout state is globally reactive
 *
 * =========================================================
 * FLOW ON APP START
 * =========================================================
 *
 * 1. React mounts root component
 * 2. AuthProvider runs session check (/api/auth/me)
 * 3. Auth state is resolved (user or null)
 * 4. App routes render based on auth state
 *
 * =========================================================
 * NOTES
 * =========================================================
 * - This is intentionally minimal
 * - No business logic should exist here
 * - All state management is delegated to providers
 */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
