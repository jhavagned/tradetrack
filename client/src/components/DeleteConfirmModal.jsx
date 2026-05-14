// /client/src/components/DeleteConfirmModal.jsx

/**
 * Modal to confirm trade deletion
 *
 * @param {Object}   trade        - The trade being deleted
 * @param {Function} onConfirm    - Called with tradeId on confirmation
 * @param {Function} onCancel     - Called when user dismisses the modal
 * @param {boolean}  isSubmitting - Disables confirm button during request
 * @param {string}   error        - Error message to display inside modal
 */
export default function DeleteConfirmModal({ trade, onConfirm, onCancel, isSubmitting, error }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5">

        <div>
          <h2 className="text-lg font-semibold text-white">Delete Trade</h2>
          <p className="text-sm text-zinc-400 mt-1">
            This action cannot be undone.
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 space-y-1">
          <p><span className="text-zinc-500">Symbol</span> · {trade.symbol}</p>
          <p><span className="text-zinc-500">Type</span> · {trade.trade_type}</p>
          <p><span className="text-zinc-500">Status</span> · {trade.trade_status}</p>
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
            onClick={() => onConfirm(trade.trade_id)}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2 text-sm transition"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}