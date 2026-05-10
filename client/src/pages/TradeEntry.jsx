// /client/src/pages/TradeEntry.jsx

// =========================
// Imports
// =========================
import { useEffect, useState, useMemo } from "react";
import { API_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  validatePositiveNumber,
  validatePositiveInteger,
  validateExitAfterEntry,
  validateExitFields
} from "../utils/validation";

/**
 * =========================================================
 * TRADE ENTRY PAGE
 * =========================================================
 *
 * PURPOSE:
 * - Create and view trades
 * - Display P&L summary
 * - Handle logout
 *
 * AUTH:
 * - Controlled entirely by AuthContext
 * - No local auth mutations allowed here
 * =========================================================
 */

// =========================
// Constants
// =========================

/**
 * Trade type constants to avoid string mismatch bugs
 */
const TRADE_TYPES = {
  BUY: "BUY",
  SELL: "SELL"
};

/**
 * Futures contract multipliers
 * Used to calculate actual dollar P&L
 */
const SYMBOL_MULTIPLIERS = {
  NQ: 20, ES: 50, YM: 5, RTY: 50,
  MNQ: 2, MES: 5, MYM: 0.5, M2K: 5
};

// =========================
// Component
// =========================
export default function TradeEntry() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  // =========================
  // State
  // =========================

  /**
   * Represents the current trade form input
   */
  const [trade, setTrade] = useState({
    symbol: "",
    type: TRADE_TYPES.BUY,
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    entryTime: "",
    exitTime: "",
    notes: "",
    strategy: ""
  });

  const [formError, setFormError] = useState("");
  /**
   * Stores all trades fetched from backend
   */
  const [trades, setTrades] = useState([]);

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // =========================
  // Helpers
  // =========================

  /**
   * Formats a number into USD currency string
   * Adds "+" sign for positive values
   */
  const formatCurrency = (value) => {
    if (value == null) return "Open";

    const sign = value > 0 ? "+" : "";

    return (
      sign +
      value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
      })
    );
  };

  /**
   * UI color based on P&L
   */
  const getPnlColor = (value) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-zinc-400";
  };

  /**
   * Safe P&L calculation
   * Handles BUY/SELL logic explicitly
   */
  const calculatePnL = (t) => {
    if (!t || t.exit_price == null) return null;
    const multiplier = SYMBOL_MULTIPLIERS[t.symbol?.toUpperCase()] || 1;

    const isBuy = t.trade_type === "BUY";
    const diff = isBuy
      ? (t.exit_price - t.entry_price)
      : (t.entry_price - t.exit_price);
    return diff * t.quantity * multiplier;
  };

  /**
   * Formats an ISO datetime string into a readable short format
   * e.g. "Jan 5, 02:30 PM"
   */
  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /**
   * Formats a numeric price to 2 decimal places
   * e.g. 19500.2500 → "19,500.25"
   */
  const formatPrice = (value) => {
    if (value == null) return "—";
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /**
   * Formats quantity as a whole number integer
   * e.g. 1.0000 → "1"
   */
  const formatQuantity = (value) => {
    if (value == null) return "—";
    return parseInt(value, 10).toString();
  };

  // =========================
  // Derived State
  // =========================

  /**
   * Total P&L across all trades
   */
  const totalPnl = useMemo(() => {
    return trades.reduce((sum, t) => {
      const pnl = calculatePnL(t);
      return sum + (pnl || 0);
    }, 0);
  }, [trades]);

  // =========================
  // Handlers
  // =========================

  /**
   * Handles all input changes dynamically
   * Uses "name" attribute to update correct field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setTrade((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Submit trade to backend
   * Includes validation + safe state update
   * - Formats data
   * - Sends POST request
   * - Updates UI optimistically
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    
    // =========================
    // Frontend Validation
    // =========================
    const entryPriceError    = validatePositiveNumber(trade.entryPrice, "Entry price");
    const quantityError      = validatePositiveInteger(trade.quantity, "Quantity");
    const exitPriceError     = trade.exitPrice ? validatePositiveNumber(trade.exitPrice, "Exit price") : null;
    const exitFieldsError    = validateExitFields(trade.exitPrice, trade.exitTime);
    const exitAfterEntryError = validateExitAfterEntry(trade.entryTime, trade.exitTime);

    const validationError = entryPriceError || quantityError || exitPriceError || exitFieldsError || exitAfterEntryError;

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const formattedTrade = {
      ...trade,
      symbol: trade.symbol.toUpperCase(),
      type: trade.type.toUpperCase(),
      entryPrice: Number(trade.entryPrice),
      exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
      quantity: Number(trade.quantity)
    };

    try {
      const res = await fetch(`${API_URL}/api/trades`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedTrade)
      });

      const data = await res.json();

      // =========================
      // API Guard
      // =========================
      if (!res.ok || data.status !== "success") {
        console.error("API Error:", data.message);
        return;
      }

      // =========================
      // Safe state update
      // Update UI without re-fetch
      // =========================
      if (data?.data) {
        setTrades((prev) => [...prev, data.data]);
      }

      // Reset form
      setTrade({
        symbol: "",
        type: TRADE_TYPES.BUY,
        entryPrice: "",
        exitPrice: "",
        quantity: "",
        entryTime: "",
        exitTime: "",
        notes: "",
        strategy: ""
      });

    } catch (err) {
      console.error("Network error:", err);
    }
  };


  // =========================
  // Effects
  // =========================

  /**
   * Fetch trades on initial load
   */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/trades`, {
          method: "GET",
          credentials: "include"
        });

        if (res.status === 401) {
          await logout();
          return navigate("/login");
        }

        const data = await res.json();

        if (data?.data) {
          setTrades(data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchTrades();
  }, []);

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

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Total P&L</p>
              <p className={`text-lg font-bold ${getPnlColor(totalPnl)}`}>
                {formatCurrency(totalPnl)}
              </p>
            </div>

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

        {/* TRADE ENTRY FORM */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            New Trade
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ROW 1: Symbol, Type, Quantity */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Symbol
                  </label>
                  <input
                    name="symbol"
                    value={trade.symbol}
                    onChange={handleChange}
                    placeholder="e.g. NQ"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Type
                  </label>
                  <select
                    name="type"
                    value={trade.type}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    <option value={TRADE_TYPES.BUY}>Buy</option>
                    <option value={TRADE_TYPES.SELL}>Sell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Lot Size
                  </label>
                  <input
                    name="quantity"
                    value={trade.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* ROW 2: Entry Price, Exit Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Entry Price
                  </label>
                  <input
                    name="entryPrice"
                    value={trade.entryPrice}
                    onChange={handleChange}
                    placeholder="e.g. 19500.00"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Exit Price <span className="text-zinc-600 normal-case">(optional)</span>
                  </label>
                  <input
                    name="exitPrice"
                    value={trade.exitPrice}
                    onChange={handleChange}
                    placeholder="e.g. 19600.00"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* ROW 3: Entry Time, Exit Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Entry Time
                  </label>
                  <input
                    type="datetime-local"
                    name="entryTime"
                    value={trade.entryTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Exit Time <span className="text-zinc-600 normal-case">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="exitTime"
                    value={trade.exitTime}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* ROW 4: Strategy, Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Strategy
                  </label>
                  <input
                    name="strategy"
                    value={trade.strategy}
                    onChange={handleChange}
                    placeholder="e.g. Breakout"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={trade.notes}
                    onChange={handleChange}
                    placeholder="Trade notes..."
                    rows={1}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              {/* VALIDATION ERROR */}
              {formError && (
                <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
                  {formError}
                </p>
              )}

              {/* SUBMIT */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition"
                >
                  Add Trade
                </button>
              </div>

            </form>
          </div>
        </section>

        {/* TRADE LIST */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Trade Log
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* TABLE HEADER */}
            <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <span>Symbol</span>
              <span>Type</span>
              <span>Entry Time</span>
              <span>Entry Price</span>
              <span>Exit Price</span>
              <span>Qty</span>
              <span className="text-right">P&L</span>
            </div>

            {/* TRADE ROWS */}
            {trades.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-600 text-sm">
                No trades yet. Add your first trade above.
              </div>
            ) : (
              trades.filter(Boolean).map((t) => {
                const pnl = calculatePnL(t);
                const isOpen = t.exit_price == null;

                return (
                  <div
                    key={t.trade_id || `${t.symbol}-${t.entry_time}`}
                    className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition text-sm"
                  >
                    <span className="font-medium text-white">{t.symbol}</span>

                    <span className={t.trade_type === "BUY" ? "text-emerald-400" : "text-red-400"}>
                      {t.trade_type}
                    </span>

                    <span className="text-zinc-400">{formatDateTime(t.entry_time)}</span>

                    <span className="text-zinc-300">{formatPrice(t.entry_price)}</span>

                    <span className="text-zinc-300">{t.exit_price != null ? formatPrice(t.exit_price) : "—"}</span>

                    <span className="text-zinc-400">{formatQuantity(t.quantity)}</span>

                    <span className={`text-right font-medium ${isOpen ? "text-zinc-500" : getPnlColor(pnl)}`}>
                      {isOpen ? "Open" : formatCurrency(pnl)}
                    </span>
                  </div>
                );
              })
            )}

          </div>
        </section>

      </main>
    </div>
  );
}