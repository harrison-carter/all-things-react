"use client";

type Status = "idle" | "pending" | "success" | "error";

const config: Record<Status, { label: string; colour: string; icon: string }> =
  {
    idle: { label: "Ready", colour: "bg-zinc-700 text-zinc-300", icon: "○" },
    pending: {
      label: "Saving…",
      colour: "bg-amber-900/60 text-amber-300",
      icon: "◌",
    },
    success: {
      label: "Saved",
      colour: "bg-emerald-900/60 text-emerald-300",
      icon: "●",
    },
    error: {
      label: "Failed",
      colour: "bg-red-900/60 text-red-300",
      icon: "✕",
    },
  };

export function NetworkStatusDisplay({ status }: { status: Status }) {
  const { label, colour, icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${colour} transition-colors`}
    >
      <span className={status === "pending" ? "animate-spin" : ""}>{icon}</span>
      {label}
    </span>
  );
}
