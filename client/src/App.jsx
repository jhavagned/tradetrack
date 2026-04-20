// /client/src/App.jsx

// =========================
// Imports
// =========================
import { useEffect, useState } from "react";
import { API_URL } from "./config/api.js";

// =========================
// Component
// =========================
function App() {
  // =========================
  // State
  // =========================

  // Form state (single trade being created)
  const [trade, setTrade] = useState({
    symbol: "",
    type: "long",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    entryTime: "",
    exitTime: "",
    notes: "",
    strategy: ""
  });

  // All trades (fetched + newly created)
  const [trades, setTrades] = useState([]);

  // =========================
  // Handlers
  // =========================

  /**
   * Generic input handler
   * Updates any field based on input "name"
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setTrade((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Form submission handler
   * - validates input
   * - formats data
   * - sends POST request
   * - updates UI instantly
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================
    // Validation
    // =========================

    // Required fields
    if (!trade.symbol || !trade.type || !trade.entryPrice || !trade.quantity) {
      console.error("Missing required fields");
      return;
    }

    // Numeric validation (handle optional exitPrice safely)
    if (
      Number(trade.entryPrice) <= 0 ||
      Number(trade.quantity) <= 0 ||
      (trade.exitPrice && Number(trade.exitPrice) <= 0)
    ) {
      console.error("Invalid numeric values");
      return;
    }

    // Partial exit validation (prevents broken "closed trades")
    const hasExitPrice = !!trade.exitPrice;
    const hasExitTime = !!trade.exitTime;

    if ((hasExitPrice || hasExitTime) && !(hasExitPrice && hasExitTime)) {
      console.error("Incomplete exit data");
      return;
    }

    // =========================
    // Data Formatting
    // =========================

    const formattedTrade = {
      ...trade,
      entryPrice: Number(trade.entryPrice),
      quantity: Number(trade.quantity),
      exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null
    };

    // =========================
    // API Call
    // =========================

    try {
      const res = await fetch(`${API_URL}/api/trades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedTrade)
      });

      if (!res.ok) {
        console.error("Failed to create trade");
        return;
      }

      const data = await res.json();

      // Defensive check
      if (!data?.data) {
        console.error("Invalid response format", data);
        return;
      }

      // =========================
      // Update UI (no re-fetch)
      // =========================
      setTrades((prev) => [...prev, data.data]);

      // =========================
      // Reset form
      // =========================
      setTrade({
        symbol: "",
        type: "long",
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
  // Effects (GET trades on load)
  // =========================
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/trades`);

        if (!res.ok) {
          console.error("Failed to fetch trades");
          return;
        }

        const data = await res.json();

        if (!data?.data) {
          console.error("Invalid response format", data);
          return;
        }

        setTrades(data.data);
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    fetchTrades();
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px" }}>
      <h1>TradeTrack</h1>

      {/* =========================
          Trade Form
      ========================= */}
      <form onSubmit={handleSubmit}>
        <input
          name="symbol"
          value={trade.symbol}
          onChange={handleChange}
          placeholder="Symbol"
        />

        <select name="type" value={trade.type} onChange={handleChange}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>

        <input
          name="entryPrice"
          value={trade.entryPrice}
          onChange={handleChange}
          placeholder="Entry Price"
        />

        <input
          name="exitPrice"
          value={trade.exitPrice}
          onChange={handleChange}
          placeholder="Exit Price"
        />

        <input
          name="quantity"
          value={trade.quantity}
          onChange={handleChange}
          placeholder="Lot Size"
        />

        <input
          type="datetime-local"
          name="entryTime"
          value={trade.entryTime}
          onChange={handleChange}
        />

        <input
          type="datetime-local"
          name="exitTime"
          value={trade.exitTime}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          value={trade.notes}
          onChange={handleChange}
          placeholder="Notes about the trade"
          rows={4}
        />

        <input
          name="strategy"
          value={trade.strategy}
          onChange={handleChange}
          placeholder="Strategy"
        />

        <button type="submit">Add Trade</button>
      </form>

      {/* =========================
          Trade List
      ========================= */}
      <div>
        <h2>Trades</h2>

        {trades.map((trade) => (
          <div key={trade.id || `${trade.symbol}-${trade.entryTime}`}>
            <p><strong>{trade.symbol}</strong></p>
            <p>{trade.type}</p>
            <p>{trade.entryPrice} → {trade.exitPrice ?? "Open"}</p>
            <p>Lot Size: {trade.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;