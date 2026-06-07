// /client/src/components/TradeDetailModal.jsx

import { formatCurrency, formatPrice, formatQuantity, formatDateTime } from "../utils/formatters";

/**
 * Emotion emoji map
 */
const EMOTION_EMOJIS = {
  Calm:      "😌",
  Confident: "💪",
  Focused:   "🎯",
  Excited:   "😄",
  Neutral:   "😐",
  Anxious:   "😰",
  Nervous:   "😬",
  Fearful:   "😨",
  Greedy:    "🤑",
  Impatient: "⏰",
  FOMO:      "😱",
  Revenge:   "😤",
};

/**
 * Single detail row
 */
function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  );
}

/**
 * Emotion display pill
 */
function EmotionPill({ label, emotion }) {
  if (!emotion) return null;
  const emoji = EMOTION_EMOJIS[emotion] || "";
  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-300">
        {emoji} {emotion}
      </span>
    </div>
  );
}

/**
 * Trade Detail Modal
 *
 * Shows all information for a single trade including
 * emotional state, notes, and strategy.
 *
 * @param {Object}   trade      - The trade to display
 * @param {number}   pnl        - Calculated P&L value
 * @param {Function} onClose    - Called when modal is dismissed
 * @param {Function} onEdit     - Called when Edit button is clicked
 * @param {Function} onDelete   - Called when Delete button is clicked
 * @param {Function} onClose    - Called when Close Trade is clicked (open trades)
 */
export default function TradeDetailModal({
  trade,
  pnl,
  onClose,
  onEdit,
  onDelete,
  onCloseTrade,
}) {
  const isOpen   = trade.exit_price == null;
  const hasEmotions = trade.emotion_before || trade.emotion_during || trade.emotion_after;
  const hasNotes = trade.notes || trade.strategy;

  const getPnlColor = (value) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-zinc-400";
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-white">{trade.symbol}</h2>
              <span className={`text-sm font-medium ${trade.trade_type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                {trade.trade_type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                isOpen
                  ? "text-amber-400 border-amber-800 bg-amber-950"
                  : "text-zinc-400 border-zinc-700 bg-zinc-800"
              }`}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className={`text-xl font-bold ${isOpen ? "text-amber-400" : getPnlColor(pnl)}`}>
              {isOpen ? "Open" : formatCurrency(pnl)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* TRADE DETAILS */}
        <div className="px-6 py-4 space-y-5">

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Entry Price" value={formatPrice(trade.entry_price)} />
            <DetailRow label="Exit Price"  value={trade.exit_price != null ? formatPrice(trade.exit_price) : "—"} />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Entry Time" value={formatDateTime(trade.entry_time)} />
            <DetailRow label="Exit Time"  value={trade.exit_time ? formatDateTime(trade.exit_time) : "—"} />
          </div>

          {/* Quantity */}
          <DetailRow label="Lot Size" value={formatQuantity(trade.quantity)} />

          {/* Strategy and Notes */}
          {hasNotes && (
            <div className="space-y-4 pt-1 border-t border-zinc-800">
              <DetailRow label="Strategy" value={trade.strategy} />
              <DetailRow label="Notes"    value={trade.notes} />
            </div>
          )}

          {/* Emotional State */}
          {hasEmotions && (
            <div className="space-y-4 pt-1 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Emotional State</p>
              <div className="grid grid-cols-3 gap-3">
                <EmotionPill label="Before" emotion={trade.emotion_before} />
                <EmotionPill label="During" emotion={trade.emotion_during} />
                <EmotionPill label="After"  emotion={trade.emotion_after} />
              </div>
            </div>
          )}

        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-800">
          {isOpen && (
            <button
              onClick={onCloseTrade}
              className="text-sm text-zinc-400 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500 rounded-lg px-4 py-2 transition"
            >
              Close Trade
            </button>
          )}
          <button
            onClick={onEdit}
            className="text-sm text-zinc-400 hover:text-blue-400 border border-zinc-700 hover:border-blue-500 rounded-lg px-4 py-2 transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500 rounded-lg px-4 py-2 transition"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}