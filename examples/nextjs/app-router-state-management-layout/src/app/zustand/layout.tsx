"use client";

import { NetworkStatusDisplay } from "@/components/network-status-display";
import { useFormStore } from "./hooks/useMutation";

export default function ZustandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useFormStore((s) => s.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Approach 3: Zustand Store</h1>
          <p className="text-sm text-zinc-500">
            No context providers — the store is a module-level singleton
          </p>
        </div>
        <NetworkStatusDisplay status={status} />
      </div>
      <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
    </div>
  );
}
