export default function RQPortalIndexPage() {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        This approach combines portals with React Query&apos;s built-in cache as the
        state bridge. The mutation is given a{" "}
        <code className="text-zinc-300">mutationKey</code>, and any component
        anywhere in the tree can read its status via{" "}
        <code className="text-zinc-300">useMutationState</code> — no Zustand,
        no extra context providers, no stores.
      </p>
      <p>
        The only provider in the tree is the root-level{" "}
        <code className="text-zinc-300">QueryClientProvider</code> that the app
        already has. Select a page above to see it in action.
      </p>
    </div>
  );
}
