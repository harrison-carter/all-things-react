"use client";

import { PortalInject } from "@/components/portal-slot";
import { BackLink } from "@/components/back-link";

export default function HybridDetailPage() {
  return (
    <>
      <PortalInject>
        <BackLink href="/hybrid/form" label="Back to form" />
      </PortalInject>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          This page portals a{" "}
          <strong className="text-zinc-300">back link</strong> into the
          layout&apos;s slot. No Zustand store is involved here — the back link
          has no dynamic state, so the portal alone handles everything. This
          shows how the hybrid approach lets each page use only the tools it
          needs.
        </p>

        <div className="space-y-3 rounded-md border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">
            Post #1 — Hello World
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-zinc-500">Author</dt>
            <dd className="text-zinc-300">Jane Doe</dd>
            <dt className="text-zinc-500">Created</dt>
            <dd className="text-zinc-300">2 hours ago</dd>
            <dt className="text-zinc-500">Status</dt>
            <dd>
              <span className="inline-block rounded-full bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-300">
                Published
              </span>
            </dd>
          </dl>
          <p className="text-sm text-zinc-400">
            This is a sample post body. In a real application this page would
            fetch the post by ID and display its full content.
          </p>
        </div>
      </div>
    </>
  );
}
