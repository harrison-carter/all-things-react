"use client";

import { SlotContent } from "../layout-slot-context";
import { BackLink } from "@/components/back-link";

export default function ContextDetailPage() {
  return (
    <>
      <SlotContent>
        <BackLink href="/context/form" label="Back to form" />
      </SlotContent>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          This page injects a <strong className="text-zinc-300">back link</strong> into
          the layout&apos;s navbar slot using the same{" "}
          <code className="text-zinc-300">SlotContent</code> mechanism. The
          layout doesn&apos;t need to know which component is rendered — it just
          displays whatever the active page provides.
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
