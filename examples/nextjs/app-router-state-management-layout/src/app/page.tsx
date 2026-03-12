import Link from "next/link";

const approaches = [
  {
    href: "/context",
    title: "1. Context Provider",
    description:
      "Wraps the entire layout tree with a Form context provider and a LayoutSlot context. Pages use a SlotContent component to declare what appears in the navbar. Works, but the providers sit above routes that don't need them.",
  },
  {
    href: "/portal",
    title: "2. React Portal",
    description:
      "Each page uses PortalInject to teleport its own component into a slot in the layout. The cleanest approach — pages are fully decoupled and can inject arbitrary content without the layout knowing in advance.",
  },
  {
    href: "/zustand",
    title: "3. Zustand Store",
    description:
      "Pages set a slotType in a Zustand store and the layout renders the matching component. Simple and provider-free, but the layout must know about all possible slot types upfront.",
  },
  {
    href: "/hybrid",
    title: "4. Portal + Zustand Hybrid",
    description:
      "Portals for open-ended slot injection, Zustand for provider-free mutation state. The layout is fully route-agnostic, no providers wrap the tree, and each page uses only the tools it needs.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Layout State Management Demo</h1>
        <p className="mt-2 text-zinc-400">
          Four ways to surface route-specific components in a shared layout
          when the state originates from a nested route. Each approach has three
          sub-pages — a <strong>form</strong> (save status badge), a{" "}
          <strong>detail</strong> view (back link), and a{" "}
          <strong>history</strong> list (action buttons) — showing how different
          components swap into the same navbar slot.
        </p>
      </div>

      <div className="grid gap-4">
        {approaches.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg border border-zinc-800 p-5 hover:border-zinc-600 transition-colors"
          >
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
