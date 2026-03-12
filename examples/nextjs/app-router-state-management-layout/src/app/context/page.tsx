"use client";

import { useState } from "react";
import { useFormContext } from "./form-context";

export default function ContextFormPage() {
  const { submit, status, reset } = useFormContext();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ title, body });
      }}
    >
      <p className="text-sm text-zinc-400">
        The mutation lives in a context provider that wraps this entire layout
        segment. The status badge above reads from that same context. Even if
        there were sibling routes here that had nothing to do with the form,
        they&apos;d still be wrapped by the provider.
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
  );
}
