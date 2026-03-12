import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
    >
      <span>←</span>
      {label}
    </Link>
  );
}
