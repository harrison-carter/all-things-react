# Next.js App Router — Layout State Management Demo

Three approaches to a common problem in the App Router: **how do you surface stateful UI in a shared layout when the state originates in a nested route?**

The concrete example is a network-status badge (idle → saving → saved → failed) that should appear at the layout level, but the React Query mutation it represents lives in a form route nested below that layout.

## The Problem

In the App Router, layouts are **persistent** — they don't re-render when you navigate between sibling routes. This is great for performance, but it creates a tension: if a layout needs to display state that only one child route cares about, where does that state live?

You can't "pass props up" from a page to its layout. Layouts receive `children` as an opaque slot — they have no knowledge of which page is currently rendered or what that page's internal state looks like. So you need a mechanism to bridge that gap.

This demo explores three different mechanisms, each with meaningfully different tradeoffs.

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The home page links to all three approaches.

Each route has a form that POSTs to `jsonplaceholder.typicode.com/posts` (a free public dummy API) and a status badge in the layout header showing the mutation state in real time.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout: Nav + QueryClientProvider
│   ├── page.tsx                ← Home: explains & links to 3 approaches
│   ├── providers.tsx           ← React Query provider
│   ├── context/
│   │   ├── layout.tsx          ← FormContextProvider wraps ENTIRE sub-tree + status badge
│   │   ├── form-context.tsx    ← Context with RQ mutation inside
│   │   ├── network-status.tsx  ← Reads status from context
│   │   └── page.tsx            ← Form that calls submit via context
│   ├── portal/
│   │   ├── layout.tsx          ← Has a <PortalTarget> div + PortalSlotProvider
│   │   ├── form-context.tsx    ← Context scoped to page level only
│   │   └── page.tsx            ← Wraps itself in provider, portals status badge UP
│   └── zustand/
│       ├── hooks/
│       │   └── useMutation/
│       │       ├── index.ts            ← Barrel export
│       │       ├── store.ts            ← Zustand store holding status state
│       │       └── useFormMutation.ts  ← useMutation hook that syncs status into the store
│       ├── layout.tsx          ← useFormStore(s => s.status) — no providers
│       └── page.tsx            ← useFormMutation() for submit/reset
├── components/
│   ├── nav.tsx                 ← Top nav with active route highlighting
│   ├── network-status-display.tsx ← Shared presentational status badge
│   └── portal-slot.tsx         ← PortalTarget / PortalInject / PortalSlotProvider
└── lib/
    └── api.ts                  ← POST to jsonplaceholder.typicode.com/posts
```

---

## Approach 1: Context Provider (`/context`)

### How it works

A `FormContextProvider` wraps the **entire layout sub-tree** at the `/context` layout level. This provider creates a React Query mutation internally and exposes `{ status, submit, reset }` through context. Both the layout (which renders the status badge) and the page (which renders the form) consume the same context.

### Why it needs to be this way

React context is scoped by the tree. A consumer can only read from a provider that sits **above it** in the component hierarchy. Since the status badge lives in the layout and the form lives in the page, the provider must wrap both — which means it has to live at or above the layout level.

In the App Router, a route segment's `layout.tsx` is the highest point you can inject client-side providers for that segment's tree. So the `FormContextProvider` goes there.

### Tradeoffs

- **Simple and idiomatic** — this is the "standard React" way to share state across a tree. No escape hatches, no external libraries, easy to follow.
- **Provider bloat** — the provider wraps every child route under `/context`, even routes that have nothing to do with the form. In a real app with multiple concerns, this leads to a growing stack of providers at the layout level, each re-rendering their sub-tree when their state changes.
- **Wasted re-renders** — when the mutation status changes, React re-renders from the provider downward. Every component in the sub-tree that doesn't memoise will re-render, even if it doesn't use the form context. In this demo there's only one page, but imagine sibling routes like `/context/settings` or `/context/history` — they'd all sit inside the provider and participate in those re-renders.
- **Mutation logic lives "too high"** — the React Query mutation is instantiated inside the provider at the layout level. Conceptually, the mutation belongs to the form. Hoisting it to the layout is a concession to the rendering hierarchy, not a reflection of the actual data flow.

### Gotchas

- If you forget that the provider is at the layout level, you might accidentally rely on context values in sibling routes that have nothing to do with the form — and it'll work, which makes the coupling invisible until it causes a bug.
- The context value object `{ status, submit, reset }` is recreated on every render of the provider. If you're not careful, this can trigger unnecessary re-renders in consumers. In production you'd typically stabilise this with `useMemo`, though this demo omits it for clarity.

---

## Approach 2: React Portal (`/portal`)

### How it works

The layout renders an empty `<PortalTarget>` div where the status badge should appear. The **page** wraps itself in its own `PortalFormContextProvider` and renders a `<PortalInject>` component that uses `ReactDOM.createPortal` to teleport the status badge into that target div up in the layout's DOM.

The key insight: the status badge **appears** to be in the layout, but its position in the **React tree** is inside the page. This means it can read from a context provider that only wraps the page, not the whole layout.

### Why it needs to be this way

The portal solves the fundamental tension: the badge needs to _render_ in the layout's DOM for visual placement, but it needs to _exist_ in the page's React tree for context access. `createPortal` is the React primitive that decouples DOM placement from tree position.

The `PortalSlotProvider` context passes the target element ID from the layout down to the page so the page knows _where_ to inject. This is a lightweight coordination mechanism — the layout says "there's a slot here with this ID", and any child route can optionally fill it.

### Tradeoffs

- **Scoped providers** — the context provider only wraps the form route. If you navigate to a hypothetical `/portal/settings` sibling route, there's no form provider in the tree, no wasted re-renders, no accidental coupling.
- **Composable** — different child routes can inject different components into the same portal slot, or nothing at all. The layout doesn't need to know which route is active or conditionally render based on the pathname.
- **More moving parts** — you need a portal target component, a portal injection component, and a context to wire them together. This is more infrastructure than a simple context provider.
- **DOM/React tree mismatch** — the badge is in the layout's DOM but the page's React tree. This can be confusing when debugging with React DevTools (the component appears under the page, not where you see it on screen). Event bubbling also follows the React tree, not the DOM tree, which can cause surprises.
- **Mounting order dependency** — the portal target div must exist in the DOM before `PortalInject` tries to find it. This is handled with a `useEffect` that looks up the element after mount, but it means the badge won't appear on the very first render frame — there's a brief moment where the slot is empty. In practice this is invisible, but it's worth understanding.

### Gotchas

- If the layout re-mounts (which shouldn't happen in normal App Router navigation, but can during development with Fast Refresh), the portal target div gets a new DOM node, but the page's `useEffect` has already captured the old one. The portal silently renders into a detached node. This is mostly a dev-mode concern, but it can cause confusing "disappearing badge" bugs during hot reload.
- Server-side rendering and portals don't mix. `createPortal` is client-only. The status badge simply won't be in the initial HTML — it appears after hydration. If the badge were critical content (e.g. for SEO or accessibility), this would be a problem.
- If multiple child routes try to inject into the same portal slot simultaneously (e.g. during a route transition where both the old and new page are briefly mounted), you can get duplicate badges. In practice the App Router unmounts the old page before mounting the new one, but it's a footgun in other routing setups.

---

## Approach 3: Zustand Store (`/zustand`)

### How it works

A Zustand store (`useFormStore`) is defined as a module-level singleton that holds the mutation status. A companion `useFormMutation` hook wraps React Query's `useMutation` and syncs its status into the store via a `useEffect`. The page calls `useFormMutation()` to get the mutation controls and trigger the sync. The layout calls `useFormStore(s => s.status)` to read the status — no providers, no tree position requirements.

The key design: React Query still owns the mutation lifecycle (retries, deduplication, devtools, etc.), but Zustand acts as a bridge that makes the status readable from anywhere in the tree without a shared context provider.

### Why it needs to be this way

`useMutation` is a React hook — it can only be called inside a React component or another hook, not inside a Zustand store creator function. So the mutation can't live _in_ the store directly. Instead, the store acts as a shared state bus: the `useFormMutation` hook runs the mutation and pushes status updates into the store, and any other component can subscribe to those updates through the store.

Zustand stores are JavaScript module singletons. When two components import the same store, they get the same instance — the React component tree is irrelevant. This sidesteps the "where does the provider go?" problem because there is no provider.

### Tradeoffs

- **Zero tree-position concerns** — any component can subscribe to the store without needing to be wrapped in anything. No provider nesting, no portal infrastructure, no coordination between layout and page.
- **Keeps React Query's features** — because the mutation is still driven by `useMutation`, you retain automatic retries, deduplication, React Query devtools integration, cache invalidation, `onSuccess`/`onError` callbacks, and lifecycle-aware cleanup (e.g. cancelling on unmount). The store is a thin synchronisation layer, not a replacement for React Query.
- **Selective re-renders by default** — Zustand's `useFormStore(s => s.status)` selector pattern means the layout only re-renders when `status` changes, not when any other store field changes. This is more granular than context, which re-renders all consumers when _any_ part of the context value changes.
- **Two-layer indirection** — the mental model is: `useMutation` → `useEffect` sync → Zustand store → subscriber components. This is more layers than context (where the mutation and the consumers share the same context directly). You need to understand both React Query and Zustand to follow the data flow.
- **Singleton semantics** — the store is global. If you had two independent forms that each needed their own mutation state, you'd need two stores, or a more complex store shape with keyed entries. Context naturally scopes state to a sub-tree; Zustand doesn't.
- **External dependency** — Zustand is a third-party library. It's small (~1KB) and widely adopted, but it's still a dependency that context and portals don't require.
- **The status component is statically placed in the layout** — because there's no portal and no context-driven conditional rendering, the `NetworkStatusDisplay` is hardcoded into the layout and always renders, even if the active child route has nothing to do with a form. Compare this with the portal approach, where the badge only appears when a form route mounts and injects it — if you navigate to a non-form sibling route, the portal slot is simply empty. With Zustand, you'd need to add your own conditional logic in the layout (e.g. checking pathname, or adding a `visible` flag to the store) to hide the badge on irrelevant routes. This partially undermines the "zero coordination" selling point — you've removed the need for context wrappers, but you've re-introduced a different kind of coupling between the layout and the routes it hosts.
- **State persists across navigations** — because the store is a module singleton, the status doesn't reset when you navigate away from `/zustand` and back. With the context approach, navigating away unmounts the provider and resets state. Whether persistence is desirable depends on your use case — sometimes you want "saved" to stick around, sometimes you want a fresh state on every visit. This compounds the static-placement issue above: not only is the badge always visible, it can show stale state from a previous visit to the form route.

### Gotchas

- The `useEffect` that syncs mutation status into the store runs _after_ render, so there's a one-frame delay between the mutation status changing and the store (and its subscribers) updating. In practice this is imperceptible, but it means the store is always one render cycle behind the actual mutation. If you need perfectly synchronous reads, you'd need to call `setStatus` inside the mutation callbacks (`onMutate`, `onSuccess`, `onError`) instead of a `useEffect`, though this adds more wiring.
- The `useFormMutation` hook must be called somewhere in the tree for the sync to happen. If no component mounts it, the store stays at its initial `"idle"` state forever. This is unlike the context approach where the provider _is_ the mutation — here the mutation and the store are separate concerns that need to be connected by a mounted hook.
- The store is shared across the entire application. If you accidentally use the same store in an unrelated component, you'll get real state coupling that's invisible in the component tree — it only shows up as unexpected re-renders or state changes.
- Server components cannot use Zustand (or any hooks). The layout in this demo is a client component (`"use client"`). If you needed the layout to be a server component, you'd have to push the store subscription into a client child component, which partially negates the "just import the hook anywhere" simplicity.
- Zustand stores are not garbage collected. If you create stores dynamically (e.g. one per form instance), you need to clean them up manually. The singleton pattern in this demo avoids this, but it's a common pitfall in more complex setups.

---

## Which Should You Use?

There isn't a universal answer — it depends on the shape of your app and what you're optimising for.

| | Context | Portal | Zustand |
|---|---|---|---|
| **Provider needed at layout level** | Yes | No (page-scoped) | No (no provider) |
| **Extra dependencies** | None | None | `zustand` |
| **Re-render scope** | All provider children | Only portal content | Only selecting components |
| **Status badge visibility** | Always (layout-level) | Only when form route is active | Always (layout-level, static) |
| **State lifetime** | Tied to provider mount | Tied to provider mount | Module singleton (persistent) |
| **SSR-compatible** | Yes | Partial (portal is client-only) | Client components only |
| **Uses React Query mutation** | Yes | Yes | Yes (synced into store) |
| **Complexity** | Low | Medium | Medium (two-layer sync) |
| **Scales to many consumers** | Re-render cost grows | Neutral | Neutral (with selectors) |

**Context** is the right default when the state is genuinely shared across most of the sub-tree and you want to stay within React's built-in primitives.

**Portals** shine when you need a component to _visually_ live in one place but _logically_ belong to another — especially when you want to keep providers tightly scoped to the routes that actually need them.

**Zustand** is the pragmatic choice when you're tired of thinking about tree position and just want state that any component can tap into. It trades the implicit scoping of context for explicit, globally accessible state — but that global nature means UI placement decisions (like whether to show a status badge) become your responsibility again. The layout has no way to know whether a form route is active, so the badge is always rendered. You'd need to layer in your own visibility logic, which re-introduces some of the coordination that Zustand was meant to eliminate.
