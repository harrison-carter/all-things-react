"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subRoutes = [
  { path: "/form", label: "Form" },
  { path: "/detail", label: "Detail" },
  { path: "/history", label: "History" },
];

export function SubNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1">
      {subRoutes.map(({ path, label }) => {
        const href = `${basePath}${path}`;
        const active = pathname === href;
        return (
          <Link
            key={path}
            href={href}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              active
                ? "bg-zinc-700 text-white font-medium"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
