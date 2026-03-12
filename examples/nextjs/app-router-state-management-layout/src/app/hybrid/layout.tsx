import { PortalTarget, PortalSlotProvider } from "@/components/portal-slot";
import { SubNav } from "@/components/sub-nav";

export default function HybridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalSlotProvider id="hybrid-slot">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Approach 4: Portal + Zustand Hybrid
            </h1>
            <p className="text-sm text-zinc-500">
              Portals for slot injection, Zustand for mutation state — zero
              layout-level providers
            </p>
          </div>
          <PortalTarget id="hybrid-slot" />
        </div>
        <SubNav basePath="/hybrid" />
        <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
      </div>
    </PortalSlotProvider>
  );
}
