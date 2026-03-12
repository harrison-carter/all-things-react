import Link from "next/link";

export default function PortalIndexPage() {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        This approach uses{" "}
        <code className="text-zinc-300">createPortal</code> to teleport
        components from the page level up into the layout&apos;s navbar slot. No
        providers need to wrap the layout — each page owns its own state and
        just portals the relevant UI upward.
      </p>
      <p>
        Select a page above to see how each one portals a different component
        into the same slot.
      </p>
    </div>
  );
}
