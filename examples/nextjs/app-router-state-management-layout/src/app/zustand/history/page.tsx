"use client";

import { useNavbarSlot } from "../hooks/useNavbarSlot";

const fakeHistory = [
  { id: 1, title: "Hello World", status: "success", time: "2 min ago" },
  { id: 2, title: "Second Post", status: "success", time: "5 min ago" },
  { id: 3, title: "Draft Ideas", status: "error", time: "12 min ago" },
  { id: 4, title: "Testing 123", status: "success", time: "1 hour ago" },
];

export default function ZustandHistoryPage() {
  useNavbarSlot("history-actions");

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        This page sets{" "}
        <code className="text-zinc-300">slotType: &quot;history-actions&quot;</code> in the
        store. The layout reads the type and renders the matching component. A
        tradeoff: the layout must know about all possible slot types upfront,
        unlike the portal approach where pages inject arbitrary content.
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
  );
}
