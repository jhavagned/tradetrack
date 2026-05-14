// /client/src/components/EditTradeModal.jsx

import { useState } from "react";
import {
  validatePositiveNumber,
  validatePositiveInteger,
  validateExitAfterEntry,
  validateExitFields,
} from "../utils/validation";

/**
 * Modal to edit an existing trade
 *
 * Pre-populates form with existing trade data.
 * Recalculates trade_status on the backend based on exitPrice.
 *
 * @param {Object}   trade        - The trade being edited
 * @param {Function} onConfirm    - Called with (tradeId, payload) on submission
 * @param {Function} onCancel     - Called when user dismisses the modal
 * @param {boolean}  isSubmitting - Disables confirm button during request
 * @param {string}   error        - Error message to display inside modal
 */
export default function EditTradeModal({ trade, onConfirm, onCancel, isSubmitting, error }) {

  // Pre-populate from existing trade
  const [form, setForm] = useState({
    symbol:     trade.symbol       || "",
    type:       trade.trade_type   || "BUY",
    entryPrice: trade.entry_price  || "",
    exitPrice:  trade.exit_price   || "",
    entryTime:  trade.entry_time   ? trade.entry_time.slice(0, 16) : "",
    exitTime:   trade.exit_time    ? trade.exit_time.slice(0, 16)  : "",
    quantity:   trade.quantity     || "",
    notes:      trade.notes        || "",
    strategy:   trade.strategy     || "",
  });

  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setFormError("");

    // =========================
    // Frontend Validation
    // =========================
    const entryPriceError     = validatePositiveNumber(form.entryPrice, "Entry price");
    const quantityError       = validatePositiveInteger(form.quantity, "Quantity");
    const exitPriceError      = form.exitPrice ? validatePositiveNumber(form.exitPrice, "Exit price") : null;
    const exitFieldsError     = validateExitFields(form.exitPrice, form.exitTime);
    const exitAfterEntryError = validateExitAfterEntry(form.entryTime, form.exitTime);

    const validationError = entryPriceError || quantityError || exitPriceError || exitFieldsError || exitAfterEntryError;

    if (validationError) {
      setFormError(validationError);
      return;
    }

    onConfirm(trade.trade_id, {
      ...form,
      symbol:     form.symbol.toUpperCase(),
      type:       form.type.toUpperCase(),
      entryPrice: Number(form.entryPrice),
      exitPrice:  form.exitPrice ? Number(form.exitPrice) : null,
      quantity:   Number(form.quantity),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto">

        <div>
          <h2 className="text-lg font-semibold text-white">Edit Trade</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {trade.symbol} · {trade.trade_type}
          </p>
        </div>

        <div className="space-y-4">

          {/* ROW 1: Symbol, Type, Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Symbol</label>
              <input
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Lot Size</label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ROW 2: Entry Price, Exit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Entry Price</label>
              <input
                name="entryPrice"
                value={form.entryPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                Exit Price <span className="text-zinc-600 normal-case">(optional)</span>
              </label>
              <input
                name="exitPrice"
                value={form.exitPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ROW 3: Entry Time, Exit Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Entry Time</label>
              <input
                type="datetime-local"
                name="entryTime"
                value={form.entryTime}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">
                Exit Time <span className="text-zinc-600 normal-case">(optional)</span>
              </label>
              <input
                type="datetime-local"
                name="exitTime"
                value={form.exitTime}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ROW 4: Strategy, Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Strategy</label>
              <input
                name="strategy"
                value={form.strategy}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={1}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        </div>

        {(formError || error) && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2.5">
            {formError || error}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}