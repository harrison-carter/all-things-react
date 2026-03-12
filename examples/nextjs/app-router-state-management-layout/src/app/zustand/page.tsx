export default function ZustandIndexPage() {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        This approach uses module-level Zustand stores as singletons. The layout
        subscribes to the store and conditionally renders the appropriate navbar
        component based on a <code className="text-zinc-300">slotType</code>{" "}
        value.
      </p>
      <p>
        Select a page above to see how each one sets a different slot type in
        the store, causing the layout to render a different component.
      </p>
    </div>
  );
}
