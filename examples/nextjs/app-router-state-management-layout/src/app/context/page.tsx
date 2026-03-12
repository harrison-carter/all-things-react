import Link from "next/link";

export default function ContextIndexPage() {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        This approach wraps the entire layout segment in a{" "}
        <code className="text-zinc-300">FormContextProvider</code>. Any page
        rendered within this layout can read from — or write to — the shared
        context.
      </p>
      <p>
        Select a page above to see how each one injects a different component
        into the layout&apos;s navbar slot using{" "}
        <code className="text-zinc-300">SlotContent</code>.
      </p>
    </div>
  );
}
