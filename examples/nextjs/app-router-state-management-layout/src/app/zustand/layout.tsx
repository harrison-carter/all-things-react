"use client";

import { NetworkStatusDisplay } from "@/components/network-status-display";
import { BackLink } from "@/components/back-link";
import { HistoryActions } from "@/components/history-actions";
import { SubNav } from "@/components/sub-nav";
import { useFormStore } from "./hooks/useMutation";
import { useNavbarSlotStore } from "./hooks/useNavbarSlot";

function NavbarSlot() {
  const slotType = useNavbarSlotStore((s) => s.slotType);
  const formStatus = useFormStore((s) => s.status);

  switch (slotType) {
    case "save-status":
      return <NetworkStatusDisplay status={formStatus} />;
    case "back-link":
      return <BackLink href="/zustand/form" label="Back to form" />;
    case "history-actions":
      return (
        <HistoryActions
          onExport={() => alert("Export triggered")}
          onRefresh={() => alert("Refresh triggered")}
        />
      );
    default:
      return null;
  }
}

export default function ZustandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Approach 3: Zustand Store</h1>
          <p className="text-sm text-zinc-500">
            No context providers — stores are module-level singletons
          </p>
        </div>
        <NavbarSlot />
      </div>
      <SubNav basePath="/zustand" />
      <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
    </div>
  );
}
