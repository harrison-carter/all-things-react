import Link from "next/link";

const approaches = [
  {
    href: "/context",
    title: "1. Context Provider",
    description:
      "Wraps the entire layout tree with a Form context provider so the network status component at the nav level can read mutation state. Works, but the provider sits above routes that don't need it.",
  },
  {
    href: "/portal",
    title: "2. React Portal",
    description:
      "The form route renders a portal that injects the status component into a slot in the top-level layout. The context provider stays scoped to the form route — only the rendered output escapes upward via the portal.",
  },
  {
    href: "/zustand",
    title: "3. Zustand Store",
    description:
      "A React Query mutation syncs its status into a Zustand store. Any component anywhere in the tree can subscribe via useFormStore — no context wrappers needed at all.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Layout State Management Demo</h1>
        <p className="mt-2 text-zinc-400">
          Three ways to surface a network-status indicator in a shared layout
          from a form that lives in a nested route.
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
