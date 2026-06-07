// /client/src/pages/TradeEntry.jsx

// =========================
// Imports
// =========================
import { useEffect, useState, useMemo } from "react";
import { API_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  validatePositiveNumber,
  validatePositiveInteger,
  validateExitAfterEntry,
  validateExitFields
} from "../utils/validation";
import { formatCurrency, formatPrice, formatQuantity, formatDateTime, toUTCString } from "../utils/formatters";
import CloseTradeModal from "../components/CloseTradeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EditTradeModal from "../components/EditTradeModal";
import JournalSection from "../components/JournalSection";

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
    strategy: "",
    emotionBefore: "",
    emotionDuring: "",
    emotionAfter:  "",
  });

  const [formError, setFormError] = useState("");
  /**
   * Stores all trades fetched from backend
   */
  const [trades, setTrades] = useState([]);

  const [closingTrade, setClosingTrade]       = useState(null); 
  const [closeError, setCloseError]           = useState("");
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  const [deletingTrade, setDeletingTrade]     = useState(null);
  const [deleteError, setDeleteError]         = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [editingTrade, setEditingTrade]       = useState(null);
  const [editError, setEditError]             = useState("");
  const [editSubmitting, setEditSubmitting]   = useState(false);

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

  const handleEmotionChange = (field, value) => {
    setTrade((prev) => ({ ...prev, [field]: value }));
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
      quantity: Number(trade.quantity),
      entryTime:     toUTCString(trade.entryTime),
      exitTime:      toUTCString(trade.exitTime),
      emotionBefore: trade.emotionBefore || null,
      emotionDuring: trade.emotionDuring || null,
      emotionAfter:  trade.emotionAfter  || null,
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
        setFormError(data.error?.message || "Failed to create trade");
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
        strategy: "",
        emotionBefore: "",
        emotionDuring: "",
        emotionAfter:  "",
      });

    } catch (err) {
      console.error("Network error:", err);
    }
  };

  /**
   * Submit close trade request to backend
   * Updates trade row in place on success
   */
  const handleCloseTrade = async (tradeId, exitPrice, exitTime) => {
    setCloseError("");
    setCloseSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/trades/${tradeId}/close`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitPrice: Number(exitPrice), exitTime }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setCloseError(data.error?.message || "Failed to close trade");
        return;
      }

      // Update the row in place — no re-fetch needed
      setTrades((prev) =>
        prev.map((t) => (t.trade_id === tradeId ? data.data : t))
      );

      setClosingTrade(null);
    } catch (err) {
      console.error("Close trade error:", err);
      setCloseError("Network error. Please try again.");
    } finally {
      setCloseSubmitting(false);
    }
  };

  /**
   * Submit delete trade request to backend
   * Removes trade row from list on success
   */
  const handleDeleteTrade = async (tradeId) => {
    setDeleteError("");
    setDeleteSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/trades/${tradeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setDeleteError(data.error?.message || "Failed to delete trade");
        return;
      }

      // Remove row without re-fetch
      setTrades((prev) => prev.filter((t) => t.trade_id !== tradeId));
      setDeletingTrade(null);
    } catch (err) {
      console.error("Delete trade error:", err);
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  /**
   * Submit edit trade request to backend
   * Updates trade row in place on success
   */
  const handleEditTrade = async (tradeId, payload) => {
    setEditError("");
    setEditSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/trades/${tradeId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setEditError(data.error?.message || "Failed to update trade");
        return;
      }

      // Update the row in place — no re-fetch needed
      setTrades((prev) =>
        prev.map((t) => (t.trade_id === tradeId ? data.data : t))
      );

      setEditingTrade(null);
    } catch (err) {
      console.error("Edit trade error:", err);
      setEditError("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
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
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Trade<span className="text-emerald-400">Track</span>
          </h1>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Total P&L</p>
              <p className={`text-base sm:text-lg font-bold ${getPnlColor(totalPnl)}`}>
                {formatCurrency(totalPnl)}
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 sm:px-4 py-2 transition"
            >
              Dashboard
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 sm:px-4 py-2 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* TRADE ENTRY FORM */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            New Trade
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ROW 1: Symbol, Type, Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* JOURNAL SECTION */}
              <JournalSection
                emotionBefore={trade.emotionBefore}
                emotionDuring={trade.emotionDuring}
                emotionAfter={trade.emotionAfter}
                onChange={handleEmotionChange}
              />

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

            {/* TABLE — desktop only */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-10 gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <span>Symbol</span>
                <span>Type</span>
                <span>Entry Time</span>
                <span>Entry Price</span>
                <span>Exit Time</span>
                <span>Exit Price</span>
                <span>Qty</span>
                <span className="text-right">P&L</span>
                <span className="col-span-2"></span>
              </div>

              {trades.length === 0 ? (
                <div className="px-6 py-12 text-center text-zinc-600 text-sm">
                  No trades yet. Add your first trade above.
                </div>
              ) : (
                trades.filter(Boolean).map((t) => {
                  const pnl = calculatePnL(t);
                  const isOpen = t.exit_price == null;

                  console.log("entry_time raw:", t.entry_time);
                  console.log("formatted:", formatDateTime(t.entry_time));

                  return (
                    <div
                      key={t.trade_id || `${t.symbol}-${t.entry_time}`}
                      className="grid grid-cols-10 gap-4 px-6 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition text-sm items-center"
                    >
                      <span className="font-medium text-white">{t.symbol}</span>
                      <span className={t.trade_type === "BUY" ? "text-emerald-400" : "text-red-400"}>
                        {t.trade_type}
                      </span>
                      <span className="text-zinc-400">{formatDateTime(t.entry_time)}</span>
                      <span className="text-zinc-300">{formatPrice(t.entry_price)}</span>
                      <span className="text-zinc-400">{formatDateTime(t.exit_time)}</span>
                      <span className="text-zinc-300">{t.exit_price != null ? formatPrice(t.exit_price) : "—"}</span>
                      <span className="text-zinc-400">{formatQuantity(t.quantity)}</span>
                      <span className={`text-right font-medium ${isOpen ? "text-amber-400" : getPnlColor(pnl)}`}>
                        {isOpen ? "Open" : formatCurrency(pnl)}
                      </span>
                      <div className="col-span-2 flex justify-end gap-2">
                        {isOpen && (
                          <button
                            onClick={() => { setCloseError(""); setClosingTrade(t); }}
                            className="text-xs text-zinc-400 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500 rounded-md px-3 py-1 transition"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => { setEditError(""); setEditingTrade(t); }}
                          className="text-xs text-zinc-400 hover:text-blue-400 border border-zinc-700 hover:border-blue-500 rounded-md px-3 py-1 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeleteError(""); setDeletingTrade(t); }}
                          className="text-xs text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500 rounded-md px-3 py-1 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* CARDS — mobile only */}
            <div className="sm:hidden">
              {trades.length === 0 ? (
                <div className="px-4 py-12 text-center text-zinc-600 text-sm">
                  No trades yet. Add your first trade above.
                </div>
              ) : (
                trades.filter(Boolean).map((t) => {
                  const pnl = calculatePnL(t);
                  const isOpen = t.exit_price == null;

                  return (
                    <div
                      key={t.trade_id || `${t.symbol}-${t.entry_time}`}
                      className="px-4 py-4 border-b border-zinc-800 last:border-0 space-y-3"
                    >
                      {/* Top row — symbol, type, P&L */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white text-base">{t.symbol}</span>
                          <span className={`text-sm font-medium ${t.trade_type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                            {t.trade_type}
                          </span>
                        </div>
                        <span className={`font-semibold ${isOpen ? "text-amber-400" : getPnlColor(pnl)}`}>
                          {isOpen ? "Open" : formatCurrency(pnl)}
                        </span>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Entry</p>
                          <p className="text-zinc-300">{formatPrice(t.entry_price)}</p>
                          <p className="text-zinc-500 text-xs">{formatDateTime(t.entry_time)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Exit</p>
                          <p className="text-zinc-300">{t.exit_price != null ? formatPrice(t.exit_price) : "—"}</p>
                          <p className="text-zinc-500 text-xs">{formatDateTime(t.exit_time)}</p>
                        </div>
                      </div>

                      {/* Qty row */}
                      <div className="text-sm">
                        <span className="text-zinc-500">Qty </span>
                        <span className="text-zinc-300">{formatQuantity(t.quantity)}</span>
                      </div>

                      {(t.emotion_before || t.emotion_during || t.emotion_after) && (
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-400 pt-1">
                          {t.emotion_before && <span>Before: {t.emotion_before}</span>}
                          {t.emotion_during && <span>During: {t.emotion_during}</span>}
                          {t.emotion_after  && <span>After: {t.emotion_after}</span>}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {isOpen && (
                          <button
                            onClick={() => { setCloseError(""); setClosingTrade(t); }}
                            className="text-xs text-zinc-400 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500 rounded-md px-3 py-1.5 transition"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => { setEditError(""); setEditingTrade(t); }}
                          className="text-xs text-zinc-400 hover:text-blue-400 border border-zinc-700 hover:border-blue-500 rounded-md px-3 py-1.5 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeleteError(""); setDeletingTrade(t); }}
                          className="text-xs text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500 rounded-md px-3 py-1.5 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </section>
        {closingTrade && (
          <CloseTradeModal
            trade={closingTrade}
            onConfirm={handleCloseTrade}
            onCancel={() => { setClosingTrade(null); setCloseError(""); }}
            isSubmitting={closeSubmitting}
            error={closeError}
          />
        )}
        
        {deletingTrade && (
          <DeleteConfirmModal
            trade={deletingTrade}
            onConfirm={handleDeleteTrade}
            onCancel={() => { setDeletingTrade(null); setDeleteError(""); }}
            isSubmitting={deleteSubmitting}
            error={deleteError}
          />
        )}

        {editingTrade && (
          <EditTradeModal
            trade={editingTrade}
            onConfirm={handleEditTrade}
            onCancel={() => { setEditingTrade(null); setEditError(""); }}
            isSubmitting={editSubmitting}
            error={editError}
          />
        )}
      </main>
    </div>
  );
}