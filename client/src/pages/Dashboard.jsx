// /client/src/pages/Dashboard.jsx

// =========================
// Imports
// =========================
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * =========================================================
 * DASHBOARD PAGE
 * =========================================================
 *
 * PURPOSE:
 * - Display P&L over time (bar chart)
 * - Display win rate stat card
 * - Display symbol breakdown table
 *
 * AUTH:
 * - Controlled entirely by AuthContext
 * - No local auth mutations allowed here
 * =========================================================
 */

// =========================
// Custom Tooltip for chart
// =========================
const PnLTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const color = value >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className={`font-semibold ${color}`}>{formatCurrency(value)}</p>
    </div>
  );
};

// =========================
// Component
// =========================
export default function Dashboard() {
  const navigate  = useNavigate();
  const { logout } = useAuth();

  // =========================
  // State
  // =========================
  const [period, setPeriod]               = useState("day");
  const [pnlData, setPnlData]             = useState([]);
  const [winRate, setWinRate]             = useState(null);
  const [symbols, setSymbols]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // =========================
  // Helpers
  // =========================
  const getPnlColor = (value) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-zinc-400";
  };

  // =========================
  // Handlers
  // =========================
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // =========================
  // Data Fetching
  // =========================
  const fetchAnalytics = async (selectedPeriod) => {
    setLoading(true);
    setError("");

    try {
      const [pnlRes, winRateRes, symbolsRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/pnl?period=${selectedPeriod}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/analytics/win-rate`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/analytics/symbols`, {
          credentials: "include",
        }),
      ]);

      if (pnlRes.status === 401) {
        await logout();
        return navigate("/login");
      }

      const [pnlData, winRateData, symbolsData] = await Promise.all([
        pnlRes.json(),
        winRateRes.json(),
        symbolsRes.json(),
      ]);

      setPnlData(pnlData.data   || []);
      setWinRate(winRateData.data || null);
      setSymbols(symbolsData.data || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Effects
  // =========================
  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Trade<span className="text-emerald-400">Track</span>
          </h1>

          <div className="flex items-center gap-4">
            <Link
              to="/trade"
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition"
            >
              Trade Log
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {error && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* WIN RATE STAT CARDS */}
        {winRate && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-4 gap-4">

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-white">{winRate.total}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Win Rate</p>
                <p className={`text-2xl font-bold ${getPnlColor(winRate.winRate)}`}>
                  {winRate.winRate}%
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Wins</p>
                <p className="text-2xl font-bold text-emerald-400">{winRate.wins}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Losses</p>
                <p className="text-2xl font-bold text-red-400">{winRate.losses}</p>
              </div>

            </div>
          </section>
        )}

        {/* P&L OVER TIME */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              P&L Over Time
            </h2>

            {/* Period toggle */}
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {["day", "week", "month"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1.5 rounded-md transition capitalize ${
                    period === p
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
                Loading...
              </div>
            ) : pnlData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
                No closed trades yet. Close some trades to see your P&L over time.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pnlData} margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={{ stroke: "#3f3f46" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={{ stroke: "#3f3f46" }}
                    tickLine={false}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip content={<PnLTooltip />} cursor={{ fill: "#27272a" }} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {pnlData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#34d399" : "#f87171"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* SYMBOL BREAKDOWN */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Symbol Breakdown
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <span>Symbol</span>
              <span className="text-right">Trades</span>
              <span className="text-right">Win Rate</span>
              <span className="text-right">Total P&L</span>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-zinc-600 text-sm">
                Loading...
              </div>
            ) : symbols.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-600 text-sm">
                No closed trades yet. Close some trades to see your symbol breakdown.
              </div>
            ) : (
              symbols.map((s) => (
                <div
                  key={s.symbol}
                  className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition text-sm items-center"
                >
                  <span className="font-medium text-white">{s.symbol}</span>
                  <span className="text-right text-zinc-400">{s.tradeCount}</span>
                  <span className={`text-right font-medium ${getPnlColor(s.winRate - 50)}`}>
                    {s.winRate}%
                  </span>
                  <span className={`text-right font-medium ${getPnlColor(s.totalPnl)}`}>
                    {formatCurrency(s.totalPnl)}
                  </span>
                </div>
              ))
            )}

          </div>
        </section>

      </main>
    </div>
  );
}