"use client";

import { useState } from "react";
import { useFormMutation, useFormStore } from "../hooks/useFormMutation";
import { PortalInject } from "@/components/portal-slot";
import { NetworkStatusDisplay } from "@/components/network-status-display";

function PortalledStatus() {
  const status = useFormStore((s) => s.status);
  return (
    <PortalInject>
      <NetworkStatusDisplay status={status} />
    </PortalInject>
  );
}

export default function HybridFormPage() {
  const { mutate, status, reset } = useFormMutation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <>
      <PortalledStatus />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutate({ title, body });
        }}
      >
        <p className="text-sm text-zinc-400">
          The mutation state lives in a Zustand store via{" "}
          <code className="text-zinc-300">useFormMutation</code> — no context
          provider wraps the layout. The status badge is portalled into the
          layout&apos;s slot via{" "}
          <code className="text-zinc-300">PortalInject</code>, reading directly
          from the store with{" "}
          <code className="text-zinc-300">useFormStore</code>. Both mechanisms
          are page-scoped: the portal unmounts when you navigate away, and no
          provider sits above sibling routes.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            placeholder="Post title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            rows={3}
            placeholder="Post body"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={status === "pending"}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
          {(status === "success" || status === "error") && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </>
  );
}
