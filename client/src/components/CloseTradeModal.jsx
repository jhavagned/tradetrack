// /client/src/components/CloseTradeModal.jsx

import { useState } from "react";
import { formatQuantity } from "../utils/formatters";

/**
 * Modal to confirm and submit close trade action
 *
 * @param {Object}   trade        - The trade being closed
 * @param {Function} onConfirm    - Called with (tradeId, exitPrice, exitTime)
 * @param {Function} onCancel     - Called when user dismisses the modal
 * @param {boolean}  isSubmitting - Disables confirm button during request
 * @param {string}   error        - Error message to display inside modal
 */
export default function CloseTradeModal({ trade, onConfirm, onCancel, isSubmitting, error }) {
  const [exitPrice, setExitPrice] = useState("");
  const [exitTime, setExitTime]   = useState("");

  const handleSubmit = () => {
    onConfirm(trade.trade_id, exitPrice, exitTime);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5">

        <div>
          <h2 className="text-lg font-semibold text-white">Close Trade</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {trade.symbol} · {trade.trade_type} · {formatQuantity(trade.quantity)} lot
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
              Exit Price
            </label>
            <input
              type="number"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="e.g. 19600.00"
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
              Exit Time
            </label>
            <input
              type="datetime-local"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg px-5 py-2 text-sm transition"
          >
            {isSubmitting ? "Closing..." : "Confirm Close"}
          </button>
        </div>

      </div>
    </div>
  );
}