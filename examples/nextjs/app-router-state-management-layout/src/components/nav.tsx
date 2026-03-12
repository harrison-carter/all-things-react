"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/context", label: "Context" },
  { href: "/portal", label: "Portal" },
  { href: "/zustand", label: "Zustand" },
  { href: "/hybrid", label: "Hybrid" },
  { href: "/rq-portal", label: "RQ + Portal" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 bg-zinc-900 px-4 py-3 text-sm">
      {links.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active
                ? "bg-zinc-700 text-white font-medium"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
