"use client";

import { SearchOverlay } from "../tools/SearchOverlay";

export const SearchPreview: React.FC = () => {
  return (
    <div className="w-full">
      <SearchOverlay
        renderTrigger={(open) => (
          <button
            type="button"
            onClick={open}
            className="w-full flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-[12px] md:text-sm text-slate-400 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] hover:text-slate-100 hover:bg-slate-900/80 transition-all"
          >
            <span className="text-slate-500 text-sm">🔍</span>
            <span className="truncate">Search users & posts…</span>
          </button>
        )}
      />

      {/* Helper example sentence – md+ only */}
      <p className="hidden md:block mt-2 text-[11px] text-slate-500/80">
        “Why do I replay conversations before sleep?”
      </p>
    </div>
  );
};
