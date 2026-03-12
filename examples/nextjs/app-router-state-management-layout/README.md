# Next.js App Router — Layout State Management Demo

Three approaches to a common problem in the App Router: **how do you render route-specific components in a shared layout when different pages need different things in the same slot?**

The concrete example is a navbar slot that changes depending on which page is active:

| Route | Navbar slot | Purpose |
|---|---|---|
| `/[approach]/form` | Save status badge (idle → saving → saved → failed) | Shows real-time mutation state from a React Query form submission |
| `/[approach]/detail` | Back link ("← Back to form") | Navigational affordance for a detail/view page |
| `/[approach]/history` | Action buttons (Export / Refresh) | Contextual actions for a list page |

The layout owns the visual placement of the slot, but each page decides _what_ appears there. The three approaches differ in how that coordination happens.

## The Problem

In the App Router, layouts are **persistent** — they don't re-render when you navigate between sibling routes. This is great for performance, but it creates a tension: if a layout needs to display state that only one child route cares about, where does that state live?

You can't "pass props up" from a page to its layout. Layouts receive `children` as an opaque slot — they have no knowledge of which page is currently rendered or what that page's internal state looks like. So you need a mechanism to bridge that gap.

This problem gets more interesting when different pages want **different components** in the same layout slot. A form page wants a save indicator. A detail page wants a back link. A history page wants action buttons. The layout can't hardcode any of these — it needs to render whatever the active page dictates.

This demo explores three mechanisms, each with meaningfully different tradeoffs.

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The home page links to all three approaches. Each approach has a tab bar to navigate between its three sub-pages (form, detail, history).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout: Nav + QueryClientProvider
│   ├── page.tsx                ← Home: explains & links to 3 approaches
│   ├── providers.tsx           ← React Query provider
│   ├── context/
│   │   ├── layout.tsx          ← FormContextProvider + LayoutSlotProvider + slot render
│   │   ├── form-context.tsx    ← Context with RQ mutation inside
│   │   ├── layout-slot-context.tsx ← Generic slot context: SlotContent + LayoutSlot
│   │   ├── network-status.tsx  ← Reads status from form context
│   │   ├── page.tsx            ← Index: explains the context approach
│   │   ├── form/page.tsx       ← Form page → injects save status badge into slot
│   │   ├── detail/page.tsx     ← Detail page → injects back link into slot
│   │   └── history/page.tsx    ← History page → injects action buttons into slot
│   ├── portal/
│   │   ├── layout.tsx          ← Has a <PortalTarget> div + PortalSlotProvider
│   │   ├── form-context.tsx    ← Context scoped to page level only
│   │   ├── page.tsx            ← Index: explains the portal approach
│   │   ├── form/page.tsx       ← Portals save status badge into layout slot
│   │   ├── detail/page.tsx     ← Portals back link into layout slot
│   │   └── history/page.tsx    ← Portals action buttons into layout slot
│   └── zustand/
│       ├── hooks/
│       │   ├── useMutation/
│       │   │   ├── index.ts            ← Barrel export
│       │   │   ├── store.ts            ← Zustand store holding mutation status
│       │   │   └── useFormMutation.ts  ← useMutation hook that syncs status into the store
│       │   └── useNavbarSlot/
│       │       ├── index.ts            ← Barrel export
│       │       ├── store.ts            ← Zustand store holding the active slot type
│       │       └── useNavbarSlot.ts    ← Hook: sets slot type on mount, clears on unmount
│       ├── layout.tsx          ← Reads from both stores, renders matching component
│       ├── page.tsx            ← Index: explains the Zustand approach
│       ├── form/page.tsx       ← Sets slotType to "save-status"
│       ├── detail/page.tsx     ← Sets slotType to "back-link"
│       └── history/page.tsx    ← Sets slotType to "history-actions"
├── components/
│   ├── nav.tsx                 ← Top nav with active route highlighting
│   ├── sub-nav.tsx             ← Tab bar for form/detail/history sub-routes
│   ├── back-link.tsx           ← Presentational back arrow link
│   ├── history-actions.tsx     ← Presentational Export/Refresh buttons
│   ├── network-status-display.tsx ← Presentational save status badge
│   └── portal-slot.tsx         ← PortalTarget / PortalInject / PortalSlotProvider
└── lib/
    └── api.ts                  ← POST to jsonplaceholder.typicode.com/posts
```

---

## Approach 1: Context Provider (`/context`)

### How it works

Two contexts collaborate at the layout level:

1. **`FormContextProvider`** wraps the entire layout sub-tree. It creates a React Query mutation internally and exposes `{ status, submit, reset }` through context. This is unchanged from the single-route version — the mutation still lives at the layout level.

2. **`LayoutSlotProvider`** wraps alongside it and holds a `slotContent` state — a React node representing whatever the active page wants to show in the navbar. Pages declare their slot content by rendering a `<SlotContent>` component, which registers its children into the context via `useEffect` and clears them on unmount. The layout renders a `<LayoutSlot>` component that reads from this context and displays whatever is currently registered.

The form page renders `<SlotContent><NetworkStatusDisplay status={status} /></SlotContent>`, reading the mutation status from `FormContextProvider`. The detail page renders `<SlotContent><BackLink /></SlotContent>`. The history page renders `<SlotContent><HistoryActions /></SlotContent>`. Each page owns its slot content declaration — the layout just renders whatever is in the slot.

### Why it needs to be this way

React context is scoped by the tree. A consumer can only read from a provider that sits **above it** in the component hierarchy. Since the navbar slot lives in the layout and the pages live below it, both the `LayoutSlotProvider` (for slot content) and the `FormContextProvider` (for mutation state) must wrap the shared tree.

The `SlotContent` pattern is essentially a context-based alternative to portals. Instead of teleporting DOM nodes, pages "register" their desired slot content into a shared context, and the layout reads it. The effect is the same — the page controls what appears in the layout — but the mechanism stays within React's context model.

### Tradeoffs

- **Stays within React primitives** — no external libraries, no portal escape hatches. The pattern is idiomatic context usage, just applied to a React node value rather than data.
- **Declarative slot ownership** — pages render `<SlotContent>` as JSX, which reads naturally and cleans up automatically on unmount. There's no imperative "set this, then clear it" lifecycle to manage.
- **Provider bloat** — every child route under `/context` is wrapped in both `FormContextProvider` and `LayoutSlotProvider`, even when a route (like `/detail` or `/history`) doesn't need the form context at all. In a real app with multiple concerns, this leads to a growing stack of providers at the layout level.
- **Wasted re-renders** — when the mutation status changes, React re-renders from the `FormContextProvider` downward. Routes that don't use the form context still participate in the reconciliation. The `LayoutSlotProvider` adds a second re-render surface: any time `slotContent` changes (i.e. on every navigation), the layout re-renders.
- **Mutation logic lives "too high"** — the React Query mutation is instantiated inside the provider at the layout level. Conceptually, the mutation belongs to the form page. Hoisting it to the layout is a concession to the rendering hierarchy, not a reflection of the actual data flow. The detail and history pages are wrapped in a form mutation provider they never use.

### Gotchas

- The `SlotContent` component uses `useEffect` to register content, which means the slot is empty on the first render frame and fills in after mount. In practice this is invisible, but it means the navbar slot flickers briefly during client-side navigation if you're watching closely.
- The `children` passed to `SlotContent` are a React node, which is a new reference on every render of the parent. This means the `useEffect` fires on every render cycle. For a demo this is fine, but in production you'd want to stabilise the children reference (e.g. with `useMemo`) to avoid unnecessary state updates.
- If you forget that `FormContextProvider` wraps the entire layout, you might accidentally use `useFormContext()` in a page that has nothing to do with forms — and it'll work, making the coupling invisible until it causes a bug.

---

## Approach 2: React Portal (`/portal`)

### How it works

The layout renders an empty `<PortalTarget>` div where the navbar slot should appear, and wraps its children in a `<PortalSlotProvider>` that passes the target element's ID down through context. Each page renders a `<PortalInject>` component that uses `ReactDOM.createPortal` to teleport its children into that target div.

The key insight: the slot content **appears** to be in the layout's DOM, but its position in the **React tree** is inside the page. This means it can read from providers that only wrap the page, not the entire layout.

Each page simply wraps whatever component it wants in `<PortalInject>`:
- The form page portals `<NetworkStatusDisplay>` (wrapped in its own `PortalFormContextProvider` at the page level).
- The detail page portals `<BackLink>`.
- The history page portals `<HistoryActions>`.

The layout doesn't know — or need to know — which component is being injected. It just provides the target.

### Why it needs to be this way

The portal solves the fundamental tension: the slot content needs to _render_ in the layout's DOM for visual placement, but it needs to _exist_ in the page's React tree for context access and lifecycle management. `createPortal` is the React primitive that decouples DOM placement from tree position.

This approach is the natural winner for the multi-component scenario. Because each page independently decides what to inject, adding a new route with a new navbar component requires zero changes to the layout. The portal infrastructure is generic — it doesn't encode any knowledge of what's being injected.

### Tradeoffs

- **Scoped providers** — the `PortalFormContextProvider` only wraps the form page. The detail and history pages have no form provider in their tree, no wasted re-renders, no accidental coupling to mutation state.
- **Fully decoupled** — the layout has no awareness of what routes exist or what they inject. Adding a fourth route with a completely new navbar component requires no layout changes. This is the only approach where the layout's code is truly route-agnostic.
- **Natural cleanup** — when you navigate away from a page, the portal content unmounts with the page. The slot is empty on routes that don't inject anything. There's no stale state to worry about.
- **More infrastructure** — you need a portal target component, a portal injection component, and a context to wire them together. This is more plumbing than a simple context value or a store flag.
- **DOM/React tree mismatch** — the badge is in the layout's DOM but the page's React tree. This can be confusing when debugging with React DevTools (the component appears under the page, not where you see it on screen). Event bubbling also follows the React tree, not the DOM tree, which can cause surprises.
- **Mounting order dependency** — the portal target div must exist in the DOM before `PortalInject` tries to find it. This is handled with a `useEffect` that looks up the element after mount, meaning the slot content won't appear on the very first render frame.

### Gotchas

- If the layout re-mounts (which shouldn't happen in normal App Router navigation, but can during development with Fast Refresh), the portal target div gets a new DOM node, but the page's `useEffect` has already captured the old one. The portal silently renders into a detached node. This is mostly a dev-mode concern, but it can cause confusing "disappearing content" bugs during hot reload.
- Server-side rendering and portals don't mix. `createPortal` is client-only. The slot content won't be in the initial HTML — it appears after hydration. If the content were critical for SEO or accessibility, this would be a problem.
- If multiple child routes try to inject into the same portal slot simultaneously (e.g. during a route transition where both the old and new page are briefly mounted), you can get duplicate content. In practice the App Router unmounts the old page before mounting the new one, but it's a footgun in other routing setups.

---

## Approach 3: Zustand Store (`/zustand`)

### How it works

Two Zustand stores collaborate:

1. **`useFormStore`** holds the mutation status (`idle`, `pending`, `success`, `error`). The `useFormMutation` hook wraps React Query's `useMutation` and syncs its status into this store via `useEffect`.

2. **`useNavbarSlotStore`** holds a `slotType` discriminator (`"save-status"`, `"back-link"`, `"history-actions"`, or `null`). Each page calls `useNavbarSlot("save-status")` (or similar) on mount, which sets the type in the store and clears it on unmount.

The layout reads from both stores. A `NavbarSlot` component switches on the `slotType` and renders the matching component — `NetworkStatusDisplay` for `"save-status"`, `BackLink` for `"back-link"`, `HistoryActions` for `"history-actions"`, or nothing for `null`.

### Why it needs to be this way

Zustand stores are JavaScript module singletons. When two components import the same store, they get the same instance — the React component tree is irrelevant. This sidesteps the "where does the provider go?" question entirely.

However, the multi-component scenario introduces a limitation: because Zustand stores hold serialisable state (not React nodes), the layout can't receive arbitrary components from pages the way a portal or context can. Instead, pages declare a _type_ (a string), and the layout maps that type to a known component. This means the layout must know about all possible slot types upfront — a closed set rather than an open one.

The `useNavbarSlot` hook encapsulates the mount/unmount lifecycle: it sets the slot type on mount and resets it to `null` on unmount, ensuring the layout reflects the current page at all times.

### Tradeoffs

- **Zero tree-position concerns** — any component can subscribe to either store without needing to be wrapped in anything. No provider nesting, no portal infrastructure, no coordination between layout and page.
- **Keeps React Query's features** — the mutation is still driven by `useMutation`, so you retain automatic retries, deduplication, devtools integration, cache invalidation, and lifecycle-aware cleanup. The store is a thin synchronisation layer.
- **Selective re-renders by default** — Zustand's selector pattern (`useFormStore(s => s.status)`) means the layout only re-renders when the selected value changes, not when any other store field changes. This is more granular than context.
- **Clean mount/unmount lifecycle** — the `useNavbarSlot` hook clears the slot type on unmount, so navigating to a route that doesn't call the hook leaves the slot empty. This solves the "stale badge" problem that a naive single-store approach would have.
- **Closed component set** — the layout must enumerate all possible slot types in a switch statement. Adding a new navbar component requires a code change in the layout, unlike the portal approach where new routes can inject arbitrary content. This re-introduces a form of coupling between the layout and the routes it hosts.
- **Two stores, two layers of indirection** — the data flow is: `useMutation` → `useEffect` sync → form store → layout; and separately: page mount → `useNavbarSlot` → slot store → layout. This is more layers than context (where everything shares a single context) or portals (where the page directly renders what appears in the layout).
- **Singleton semantics** — the stores are global. If you had two independent instances of this pattern (e.g. two sidebars each with their own slot), you'd need two sets of stores. Context and portals naturally scope state to a sub-tree.
- **External dependency** — Zustand is a third-party library. It's small (~1KB) and widely adopted, but context and portals don't require anything beyond React.

### Gotchas

- The `useEffect` that syncs mutation status into the store runs _after_ render, so there's a one-frame delay between the mutation status changing and the store updating. In practice this is imperceptible, but the store is always one render cycle behind the actual mutation. For perfectly synchronous reads, you'd need to call `setStatus` inside mutation callbacks (`onMutate`, `onSuccess`, `onError`) instead of a `useEffect`.
- The `useFormMutation` hook must be called somewhere in the tree for the status sync to happen. If no component mounts it, the form store stays at its initial `"idle"` state forever.
- If `useNavbarSlot` unmount cleanup races with the next page's mount, the slot type can briefly flicker to `null` between navigations. In practice the App Router's transition model prevents this, but it's worth understanding the timing.
- The layout in this approach is a client component (`"use client"`) because it uses hooks. If you needed the layout to be a server component, you'd have to push the store subscriptions into client child components.
- Zustand stores are not garbage collected. The singleton pattern here avoids this concern, but creating stores dynamically (e.g. one per form instance) requires manual cleanup.

---

## Which Should You Use?

There isn't a universal answer — it depends on the shape of your app and what you're optimising for.

| | Context | Portal | Zustand |
|---|---|---|---|
| **Provider needed at layout level** | Yes (two: form + slot) | No (page-scoped) | No (no provider) |
| **Extra dependencies** | None | None | `zustand` |
| **Re-render scope** | All provider children | Only portal content | Only selecting components |
| **Layout knows about slot types** | No (receives arbitrary nodes) | No (receives arbitrary nodes) | Yes (closed switch on types) |
| **Slot cleanup on navigation** | Automatic (useEffect unmount) | Automatic (portal unmounts) | Automatic (useNavbarSlot unmount) |
| **Adding a new navbar component** | New page only | New page only | New page + layout switch case |
| **State lifetime** | Tied to provider mount | Tied to page mount | Module singleton (cleared by hook) |
| **SSR-compatible** | Yes | Partial (portal is client-only) | Client components only |
| **Complexity** | Low–medium | Medium | Medium (two stores + sync) |

**Context** is the right default when you want to stay within React's built-in primitives and the provider wrapping cost is acceptable. The `SlotContent` pattern gives pages declarative control over the slot without introducing external dependencies. The main cost is provider bloat — every route is wrapped in contexts it may not need.

**Portals** are the cleanest solution for this specific problem. Each page independently owns what appears in the layout, the layout is fully route-agnostic, and providers stay scoped to the pages that need them. The tradeoff is more infrastructure (target/inject/context plumbing) and the DOM/React tree mismatch that can complicate debugging.

**Zustand** is the pragmatic choice when you want to avoid provider hierarchies entirely and you're comfortable with a closed set of slot types. The layout must enumerate all possible components upfront, which re-introduces coupling — but the mount/unmount lifecycle is clean and the re-render characteristics are excellent. It's a good fit when the set of possible navbar states is small and stable.
