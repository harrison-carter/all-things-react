"use client";

import { SlotContent } from "../layout-slot-context";
import { HistoryActions } from "@/components/history-actions";

const fakeHistory = [
  { id: 1, title: "Hello World", status: "success", time: "2 min ago" },
  { id: 2, title: "Second Post", status: "success", time: "5 min ago" },
  { id: 3, title: "Draft Ideas", status: "error", time: "12 min ago" },
  { id: 4, title: "Testing 123", status: "success", time: "1 hour ago" },
];

export default function ContextHistoryPage() {
  return (
    <>
      <SlotContent>
        <HistoryActions
          onExport={() => alert("Export triggered")}
          onRefresh={() => alert("Refresh triggered")}
        />
      </SlotContent>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          This page injects{" "}
          <strong className="text-zinc-300">action buttons</strong> into the
          layout&apos;s navbar slot. The same{" "}
          <code className="text-zinc-300">SlotContent</code> component is used —
          only the children differ.
        </p>

        <div className="divide-y divide-zinc-800 rounded-md border border-zinc-800">
          {fakeHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">#{entry.id}</span>
                <span className="text-zinc-200">{entry.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    entry.status === "success"
                      ? "bg-emerald-900/60 text-emerald-300"
                      : "bg-red-900/60 text-red-300"
                  }`}
                >
                  {entry.status}
                </span>
                <span className="text-zinc-500">{entry.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
