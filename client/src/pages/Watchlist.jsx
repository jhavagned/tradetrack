// /client/src/pages/Watchlist.jsx

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext";

/**
 * Futures proxy labels for display
 */
const FUTURES_LABELS = {
  QQQ: "NQ",
  SPY: "ES",
  IWM: "RTY",
  DIA: "YM",
};

export default function Watchlist() {
  const navigate    = useNavigate();
  const { logout }  = useAuth();

  const [quotes, setQuotes]           = useState([]);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState("");
  const [newSymbol, setNewSymbol]     = useState("");
  const [addError, setAddError]       = useState("");
  const [addLoading, setAddLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const fetchQuotes = async () => {
    setRefreshing(true);
    setError("");

    try {
      const res  = await fetch(`${API_URL}/api/watchlist/quotes`, {
        credentials: "include",
      });

      if (res.status === 401) {
        await logout();
        return navigate("/login");
      }

      const data = await res.json();

      if (data.status === "success") {
        setQuotes(data.data || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Quotes fetch error:", err);
      setError("Failed to load quotes. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchWatchlist = async () => {
    setLoading(true);

    try {
      const res  = await fetch(`${API_URL}/api/watchlist`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Watchlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymbol = async () => {
    if (!newSymbol.trim()) return;

    setAddError("");
    setAddLoading(true);

    try {
      const res  = await fetch(`${API_URL}/api/watchlist`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ symbol: newSymbol.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setAddError(data.error?.message || "Failed to add symbol");
        return;
      }

      setItems((prev) => [...prev, data.data]);
      setNewSymbol("");
      fetchQuotes();
    } catch (err) {
      console.error("Add symbol error:", err);
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (itemId, symbol) => {
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${itemId}`, {
        method:      "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setItems((prev)  => prev.filter((i) => i.item_id !== itemId));
        setQuotes((prev) => prev.filter((q) => q.symbol !== symbol));
      }
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  // =========================
  // Effects
  // =========================
  useEffect(() => {
    const init = async () => {
      await fetchWatchlist();
      await fetchQuotes();
    };
    init();
  }, []);

  // =========================
  // Helpers
  // =========================
  const getChangeColor = (value) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-zinc-400";
  };

  const formatChange = (value) => {
    if (value == null) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
  };

  const formatPercent = (value) => {
    if (value == null) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatPrice = (value) => {
    if (value == null || value === 0) return "—";
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Build a map of symbol → quote for easy lookup
  const quoteMap = quotes.reduce((acc, q) => {
    acc[q.symbol] = q;
    return acc;
  }, {});

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
            <Link
              to="/dashboard"
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 sm:px-4 py-2 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/trade"
              className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 sm:px-4 py-2 transition"
            >
              Trade Log
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Watchlist</h2>
            {lastUpdated && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Updated {lastUpdated.toLocaleTimeString("en-US", {
                  hour:   "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            )}
          </div>
          <button
            onClick={fetchQuotes}
            disabled={refreshing}
            className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* ADD SYMBOL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex gap-3">
            <input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
              placeholder="Add symbol e.g. AAPL, QQQ"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <button
              onClick={handleAddSymbol}
              disabled={addLoading || !newSymbol.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition"
            >
              {addLoading ? "Adding..." : "Add"}
            </button>
          </div>
          {addError && (
            <p className="text-xs text-red-400 mt-2">{addError}</p>
          )}
        </div>

        {/* WATCHLIST TABLE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          {/* TABLE HEADER — desktop */}
          <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
            <span>Symbol</span>
            <span className="text-right">Price</span>
            <span className="text-right">Change</span>
            <span className="text-right">Change %</span>
            <span></span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-zinc-600 text-sm">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-600 text-sm">
              Your watchlist is empty. Add a symbol above.
            </div>
          ) : (
            items.map((item) => {
              const quote = quoteMap[item.symbol];
              const label = FUTURES_LABELS[item.symbol];

              return (
                <div key={item.item_id}>

                  {/* DESKTOP ROW */}
                  <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition text-sm items-center">
                    <div>
                      <span className="font-semibold text-white">{item.symbol}</span>
                      {label && (
                        <span className="ml-2 text-xs text-zinc-500">({label})</span>
                      )}
                    </div>
                    <span className="text-right text-zinc-300">
                      {quote ? formatPrice(quote.price) : "—"}
                    </span>
                    <span className={`text-right font-medium ${quote ? getChangeColor(quote.change) : "text-zinc-500"}`}>
                      {quote ? formatChange(quote.change) : "—"}
                    </span>
                    <span className={`text-right font-medium ${quote ? getChangeColor(quote.changePercent) : "text-zinc-500"}`}>
                      {quote ? formatPercent(quote.changePercent) : "—"}
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemove(item.item_id, item.symbol)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* MOBILE CARD */}
                  <div className="sm:hidden px-4 py-4 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-white">{item.symbol}</span>
                        {label && (
                          <span className="ml-2 text-xs text-zinc-500">({label})</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.item_id, item.symbol)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-zinc-300">
                        {quote ? formatPrice(quote.price) : "—"}
                      </span>
                      <span className={`font-medium ${quote ? getChangeColor(quote.change) : "text-zinc-500"}`}>
                        {quote ? formatChange(quote.change) : "—"}
                      </span>
                      <span className={`font-medium ${quote ? getChangeColor(quote.changePercent) : "text-zinc-500"}`}>
                        {quote ? formatPercent(quote.changePercent) : "—"}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}