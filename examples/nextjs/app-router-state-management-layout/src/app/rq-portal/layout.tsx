import { PortalTarget, PortalSlotProvider } from "@/components/portal-slot";
import { SubNav } from "@/components/sub-nav";

export default function RQPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalSlotProvider id="rq-portal-slot">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Approach 5: Portal + React Query
            </h1>
            <p className="text-sm text-zinc-500">
              Portals for slot injection, React Query cache for mutation state —
              no extra dependencies
            </p>
          </div>
          <PortalTarget id="rq-portal-slot" />
        </div>
        <SubNav basePath="/rq-portal" />
        <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
      </div>
    </PortalSlotProvider>
  );
}
