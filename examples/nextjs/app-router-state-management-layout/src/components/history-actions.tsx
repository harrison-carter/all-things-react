"use client";

export function HistoryActions({
  onExport,
  onRefresh,
}: {
  onExport?: () => void;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExport}
        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
      >
        <span>↓</span>
        Export
      </button>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
      >
        <span>↻</span>
        Refresh
      </button>
    </div>
  );
}
