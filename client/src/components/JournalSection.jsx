// /client/src/components/JournalSection.jsx

import { useState } from "react";

/**
 * Emotion options with emoji representations
 */
const EMOTIONS = [
  { value: "Calm",      emoji: "😌" },
  { value: "Confident", emoji: "💪" },
  { value: "Focused",   emoji: "🎯" },
  { value: "Excited",   emoji: "😄" },
  { value: "Neutral",   emoji: "😐" },
  { value: "Anxious",   emoji: "😰" },
  { value: "Nervous",   emoji: "😬" },
  { value: "Fearful",   emoji: "😨" },
  { value: "Greedy",    emoji: "🤑" },
  { value: "Impatient", emoji: "⏰" },
  { value: "FOMO",      emoji: "😱" },
  { value: "Revenge",   emoji: "😤" },
];

/**
 * Single emotion picker row
 */
function EmotionPicker({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => (
          <button
            key={e.value}
            type="button"
            onClick={() => onChange(value === e.value ? "" : e.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition ${
              value === e.value
                ? "bg-emerald-500 border-emerald-500 text-zinc-950 font-semibold"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            <span>{e.emoji}</span>
            <span>{e.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Collapsible journal section for emotional state tracking
 *
 * @param {string}   emotionBefore - Selected emotion before trade
 * @param {string}   emotionDuring - Selected emotion during trade
 * @param {string}   emotionAfter  - Selected emotion after trade
 * @param {Function} onChange      - Called with (field, value) on change
 * @param {boolean}  defaultOpen   - Whether section starts expanded
 */
export default function JournalSection({
  emotionBefore,
  emotionDuring,
  emotionAfter,
  onChange,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">

      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 transition text-sm text-zinc-300 font-medium"
      >
        <span>Journal</span>
        <span className="text-zinc-500 text-xs">
          {isOpen ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 py-4 space-y-5 bg-zinc-900">
          <EmotionPicker
            label="Before Trade"
            value={emotionBefore}
            onChange={(val) => onChange("emotionBefore", val)}
          />
          <EmotionPicker
            label="During Trade"
            value={emotionDuring}
            onChange={(val) => onChange("emotionDuring", val)}
          />
          <EmotionPicker
            label="After Trade"
            value={emotionAfter}
            onChange={(val) => onChange("emotionAfter", val)}
          />
        </div>
      )}

    </div>
  );
}