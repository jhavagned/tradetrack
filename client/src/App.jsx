// /client/src/App.jsx

// =========================
// Imports
// =========================
import { useEffect, useState, useMemo } from "react";
import { API_URL } from "./config/api.js";

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
  NQ: 20,
  ES: 50,
  YM: 5,
  RTY: 50,
  MNQ: 2,
  MES: 5,
  MYM: 0.5,
  M2K: 5
};

// =========================
// Component
// =========================
function App() {
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

  /**
   * Stores all trades fetched from backend
   */
  const [trades, setTrades] = useState([]);

  // =========================
  // Helpers
  // =========================

  /**
 * Formats a number into USD currency string
 * Adds "+" sign for positive values
 */

  // const formatCurrency = (value) => {
  //   if (value === null || value === undefined) return "Open";

  //   const sign = value > 0 ? "+" : "";

  //   return (
  //     sign +
  //     value.toLocaleString("en-US", {
  //       style: "currency",
  //       currency: "USD",
  //       minimumFractionDigits: 2
  //     })
  //   );
  // };
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
    if (value > 0) return "green";
    if (value < 0) return "red";
    return "gray";
  };

  /**
   * Safe P&L calculation
   * Handles BUY/SELL logic explicitly
   */
  const calculatePnL = (t) => {
    if (!t || t.exitPrice == null) return null;

    const multiplier = SYMBOL_MULTIPLIERS[t.symbol?.toUpperCase()] || 1;

    const isBuy = t.type === "BUY";

    const diff = isBuy
      ? (t.exitPrice - t.entryPrice)
      : (t.entryPrice - t.exitPrice);

    return diff * t.quantity * multiplier;
  };

  // =========================
  // Derived State
  // =========================

  /**
   * Total P&L across all trades
   */
  // const totalPnl = useMemo(() => {
  //   return trades.reduce((sum, t, i) => {
  //     if (!t) {
  //       console.log("🚨 Undefined trade at index:", i);
  //       return sum;
  //     }

  //     const pnl = calculatePnL(t);
  //     return sum + (pnl || 0);
  //   }, 0);
  // }, [trades]);
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
    // const fetchTrades = async () => {
    //   const res = await fetch(`${API_URL}/api/trades`);
    //   const data = await res.json();
    //   setTrades(data.data);
    // };

    // fetchTrades();
    const fetchTrades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/trades`);
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
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1>TradeTrack</h1>

        <h2 style={{ color: getPnlColor(totalPnl) }}>
          Total P&L: {formatCurrency(totalPnl)}
        </h2>
      </div>

      {/* FORM */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>

          <input name="symbol" value={trade.symbol} onChange={handleChange} placeholder="Symbol" />

          <select name="type" value={trade.type} onChange={handleChange}>
            <option value={TRADE_TYPES.BUY}>Buy</option>
            <option value={TRADE_TYPES.SELL}>Sell</option>
          </select>

          <input name="entryPrice" value={trade.entryPrice} onChange={handleChange} placeholder="Entry Price" />
          <input name="exitPrice" value={trade.exitPrice} onChange={handleChange} placeholder="Exit Price" />
          <input name="quantity" value={trade.quantity} onChange={handleChange} placeholder="Lot Size" />

          <input type="datetime-local" name="entryTime" value={trade.entryTime} onChange={handleChange} />
          <input type="datetime-local" name="exitTime" value={trade.exitTime} onChange={handleChange} />

          <textarea name="notes" value={trade.notes} onChange={handleChange} placeholder="Notes" rows={3} />

          <input name="strategy" value={trade.strategy} onChange={handleChange} placeholder="Strategy" />

          <button type="submit">Add Trade</button>
        </form>
      </div>

      {/* TRADES */}
      <div style={styles.card}>
        <h2>Trades</h2>

        {trades.filter(Boolean).map((t) => {
          const pnl = calculatePnL(t);

          return (
            <div key={t.id || `${t.symbol}-${t.entryTime}`} style={styles.tradeRow}>

              <div>
                <strong>{t.symbol}</strong> — {t.type}
              </div>

              <div>
                {t.entryPrice} → {t.exitPrice ?? "Open"}
              </div>

              <div>Qty: {t.quantity}</div>

              <div style={{ color: getPnlColor(pnl), fontWeight: "bold" }}>
                {formatCurrency(pnl)}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

// =========================
// Styles
// =========================
const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "Arial"
  },
  header: {
    marginBottom: "20px"
  },
  card: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  form: {
    display: "grid",
    gap: "10px"
  },
  tradeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #eee"
  }
};

export default App;