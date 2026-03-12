import { PortalTarget, PortalSlotProvider } from "@/components/portal-slot";

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
              Status badge is portalled up from the form route into this layout
            </p>
          </div>
          <PortalTarget id="network-status-slot" />
        </div>
        <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
      </div>
    </PortalSlotProvider>
  );
}
