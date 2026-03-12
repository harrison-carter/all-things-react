import { PortalTarget, PortalSlotProvider } from "@/components/portal-slot";
import { SubNav } from "@/components/sub-nav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalSlotProvider id="network-status-slot">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Approach 2: React Portal</h1>
            <p className="text-sm text-zinc-500">
              Each page portals its own component into the layout&apos;s navbar slot
            </p>
          </div>
          <PortalTarget id="network-status-slot" />
        </div>
        <SubNav basePath="/portal" />
        <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
      </div>
    </PortalSlotProvider>
  );
}
