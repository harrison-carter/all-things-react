export default function HybridIndexPage() {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        This approach combines the best of portals and Zustand. Portals handle
        slot injection — pages teleport arbitrary components into the layout,
        keeping the layout fully route-agnostic. Zustand handles mutation state —
        no context providers need to wrap the layout tree.
      </p>
      <p>
        The result is zero providers at the layout level (beyond the lightweight{" "}
        <code className="text-zinc-300">PortalSlotProvider</code> that just
        passes a target ID). Select a page above to see it in action.
      </p>
    </div>
  );
}
