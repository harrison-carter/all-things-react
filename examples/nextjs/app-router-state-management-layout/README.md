# Next.js App Router — Layout State Management Demo

Five approaches to a common problem in the App Router: **how do you render route-specific components in a shared layout when different pages need different things in the same slot?**

The concrete example is a navbar slot that changes depending on which page is active:

| Route | Navbar slot | Purpose |
|---|---|---|
| `/[approach]/form` | Save status badge (idle → saving → saved → failed) | Shows real-time mutation state from a React Query form submission |
| `/[approach]/detail` | Back link ("← Back to form") | Navigational affordance for a detail/view page |
| `/[approach]/history` | Action buttons (Export / Refresh) | Contextual actions for a list page |

The layout owns the visual placement of the slot, but each page decides _what_ appears there. The five approaches differ in how that coordination happens.

## The Problem

In the App Router, layouts are **persistent** — they don't re-render when you navigate between sibling routes. This is great for performance, but it creates a tension: if a layout needs to display state that only one child route cares about, where does that state live?

You can't "pass props up" from a page to its layout. Layouts receive `children` as an opaque slot — they have no knowledge of which page is currently rendered or what that page's internal state looks like. So you need a mechanism to bridge that gap.

This problem gets more interesting when different pages want **different components** in the same layout slot. A form page wants a save indicator. A detail page wants a back link. A history page wants action buttons. The layout can't hardcode any of these — it needs to render whatever the active page dictates.

This demo explores five mechanisms — three "pure" approaches and two hybrids that combine portals with Zustand and React Query respectively.

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The home page links to all five approaches. Each approach has a tab bar to navigate between its three sub-pages (form, detail, history).

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
│   ├── zustand/
│   │   ├── hooks/
│   │   │   ├── useMutation/
│   │   │   │   ├── index.ts            ← Barrel export
│   │   │   │   ├── store.ts            ← Zustand store holding mutation status
│   │   │   │   └── useFormMutation.ts  ← useMutation hook that syncs status into the store
│   │   │   └── useNavbarSlot/
│   │   │       ├── index.ts            ← Barrel export
│   │   │       ├── store.ts            ← Zustand store holding the active slot type
│   │   │       └── useNavbarSlot.ts    ← Hook: sets slot type on mount, clears on unmount
│   │   ├── layout.tsx          ← Reads from both stores, renders matching component
│   │   ├── page.tsx            ← Index: explains the Zustand approach
│   │   ├── form/page.tsx       ← Sets slotType to "save-status"
│   │   ├── detail/page.tsx     ← Sets slotType to "back-link"
│   │   └── history/page.tsx    ← Sets slotType to "history-actions"
│   └── hybrid/
│       ├── hooks/
│       │   └── useFormMutation/
│       │       ├── index.ts            ← Barrel export
│       │       ├── store.ts            ← Zustand store for mutation status (no navbar slot store)
│       │       └── useFormMutation.ts  ← useMutation hook that syncs status into the store
│       ├── layout.tsx          ← PortalTarget + PortalSlotProvider only — no other providers
│       ├── page.tsx            ← Index: explains the hybrid approach
│       ├── form/page.tsx       ← useFormMutation (Zustand) + PortalInject for status badge
│       ├── detail/page.tsx     ← PortalInject for back link (no store needed)
│       └── history/page.tsx    ← PortalInject for action buttons (no store needed)
│   └── rq-portal/
│       ├── hooks/
│       │   ├── index.ts              ← Barrel export
│       │   ├── useFormMutation.ts    ← useMutation with a mutationKey for cache lookup
│       │   └── useFormStatus.ts      ← useMutationState to read status from RQ cache
│       ├── layout.tsx          ← PortalTarget + PortalSlotProvider only — no other providers
│       ├── page.tsx            ← Index: explains the RQ + portal approach
│       ├── form/page.tsx       ← useFormMutation + PortalInject (status via useFormStatus)
│       ├── detail/page.tsx     ← PortalInject for back link
│       └── history/page.tsx    ← PortalInject for action buttons
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

## Approach 4: Portal + Zustand Hybrid (`/hybrid`)

### How it works

This approach cherry-picks the strongest aspects of portals and Zustand while discarding the weaknesses of each:

- **Portals** handle slot injection. The layout renders a `<PortalTarget>` and wraps children in a lightweight `<PortalSlotProvider>` (which only passes a target ID — no state). Each page uses `<PortalInject>` to teleport whatever component it wants into the layout's slot. The layout is fully route-agnostic — it never needs to know what pages exist or what they inject.

- **Zustand** handles mutation state. The form page uses a `useFormMutation` hook that syncs React Query's mutation status into a Zustand store. The portalled `<NetworkStatusDisplay>` reads from that store via `useFormStore(s => s.status)`. No `FormContextProvider` wraps the layout tree.

The detail and history pages don't use Zustand at all — they just portal static components (a back link and action buttons) into the slot. Each page uses only the tools it needs.

### What gets eliminated

Compared to each pure approach, the hybrid removes specific pain points:

- **vs. Context:** No providers wrap the layout tree. The `FormContextProvider` and `LayoutSlotProvider` that the context approach needs are both gone. Sibling routes aren't wrapped in contexts they don't use, and there are no wasted re-renders from provider state changes.
- **vs. Portal (pure):** The pure portal approach needs a `PortalFormContextProvider` wrapping the form page to share mutation state between the form and the portalled status badge. The hybrid replaces this with a Zustand store — the portalled component reads directly from the store, no page-level context needed.
- **vs. Zustand (pure):** The pure Zustand approach needs a `useNavbarSlotStore` with a `slotType` discriminator and a switch statement in the layout that enumerates all possible components. The hybrid replaces this with portals — each page injects arbitrary content, and the layout doesn't need to know the set of possible slot types.

### Why this combination works

Portals and Zustand solve orthogonal problems:

- **Portals** answer: "how does the page control what appears in the layout's DOM?" They decouple DOM placement from React tree position, allowing pages to inject arbitrary content into a layout slot.
- **Zustand** answers: "how does the portalled component access state without a shared provider?" It decouples state access from tree position, allowing any component to read from a store regardless of where it sits in the component hierarchy.

Neither mechanism alone is sufficient. Portals without Zustand still need a context provider to share mutation state (the pure portal approach). Zustand without portals still needs the layout to enumerate slot types (the pure Zustand approach). Together, each one covers the other's blind spot.

### Tradeoffs

- **Minimal layout-level infrastructure** — the layout only has a `PortalSlotProvider` (which passes a string ID, not state) and a `PortalTarget` div. No form context, no slot context, no store subscriptions. The layout is a server component-compatible shell.
- **Open component set** — pages inject arbitrary components via portals. Adding a new page with a new navbar component requires zero layout changes. This matches the pure portal approach and improves on the pure Zustand approach.
- **Scoped complexity** — the Zustand store only exists for the form page's mutation state. The detail and history pages use portals alone with no store involvement. Each page pulls in only the mechanisms it needs, rather than being forced into a one-size-fits-all pattern.
- **Selective re-renders** — the portalled status badge subscribes to the store via `useFormStore(s => s.status)`, so it only re-renders when the status changes. No other component in the tree is affected.
- **Natural cleanup** — portal content unmounts with the page. The slot is empty on routes that don't inject anything, and on the index page.
- **Two mechanisms to understand** — developers need to know both the portal pattern (target/inject/context plumbing) and the Zustand pattern (store/hook/sync). This is a higher conceptual surface area than any single pure approach.
- **External dependency** — still requires `zustand`, though only for pages that have cross-component state.
- **DOM/React tree mismatch** — inherits the portal approach's debugging quirk: portalled content appears under the page in React DevTools, not where it's visible on screen.
- **Client-only slot content** — inherits the portal approach's SSR limitation: `createPortal` is client-only, so the slot content won't be in the initial HTML.

### Gotchas

- The Zustand store is a module singleton, so mutation status persists across navigations. If you submit the form, navigate to `/hybrid/detail`, and come back, the store still holds the last status. The _portal_ unmounts and remounts (clearing the visible badge), but the store retains its value. In practice this means the badge reappears with the previous status on re-mount. Whether this is desirable depends on your use case — add a store reset in the `useFormMutation` cleanup if you want fresh state on every visit.
- The `useEffect` sync between React Query and the Zustand store has the same one-frame delay as the pure Zustand approach. The store is always one render cycle behind the actual mutation status.
- The `PortalSlotProvider` uses a React context internally to pass the target ID. This is the one context in the tree — but it's static (the ID never changes), so it causes no re-renders.

---

## Approach 5: Portal + React Query (`/rq-portal`)

### How it works

This approach refines the Portal + Zustand hybrid by replacing Zustand with something the app already has: React Query's cache.

- **Portals** handle slot injection, exactly as in approaches 2 and 4. The layout renders a `<PortalTarget>` and pages use `<PortalInject>` to teleport content into it.

- **React Query's cache** handles mutation state. The `useFormMutation` hook wraps `useMutation` with a `mutationKey`, making the mutation identifiable in the QueryClient cache. A companion `useFormStatus` hook calls `useMutationState` — a TanStack Query v5 API that reads mutation state from the cache, filtered by key — to retrieve the latest status from anywhere in the tree.

The portalled status badge calls `useFormStatus()` and renders accordingly. No Zustand store, no `useEffect` sync, no extra context providers. The only provider involved is the root-level `QueryClientProvider` that every React Query app already has.

### What gets eliminated vs. the Zustand hybrid

- **The Zustand dependency** — gone entirely. No `zustand` in `package.json`, no store files, no sync hooks.
- **The `useEffect` sync layer** — the Zustand hybrid needs a `useEffect` to push mutation status from React Query into the store on every status change. This approach reads directly from React Query's cache — there's no intermediate store to keep in sync.
- **The one-frame delay** — because `useMutationState` reads from the QueryClient (which is updated synchronously by React Query), the status is always current. There's no `useEffect`-induced lag.

### Why this works

React Query's `QueryClient` is already a global, observable state store for async operations. Every mutation and query writes its state into the client's cache, and any component in the tree can subscribe to changes via hooks like `useMutationState` and `useQuery`. By giving the mutation a `mutationKey`, we make it addressable — any component can look it up by key, just like a query.

This is the same insight that makes Zustand work (global singleton, subscribe from anywhere), but using infrastructure the app already has. The `QueryClientProvider` at the root is the only "provider" in play — and it's already there for the mutation itself.

### Tradeoffs

- **Zero extra dependencies** — no Zustand, no custom context. The only requirements are React Query (which the app already uses) and the portal slot infrastructure (shared with approaches 2 and 4).
- **No sync layer** — `useMutationState` reads directly from the cache. There's no `useEffect` copying state from one system to another, which means fewer moving parts and no stale-by-one-frame issues.
- **Open component set** — pages inject arbitrary components via portals. The layout is fully route-agnostic, same as approaches 2 and 4.
- **Scoped complexity** — the detail and history pages use portals alone. Only the form page interacts with React Query hooks. Each page uses only what it needs.
- **Natural cleanup** — portal content unmounts with the page. The slot is empty on routes that don't inject anything.
- **Mutation state persists in cache** — like the Zustand hybrid, the mutation state lives in a singleton (the QueryClient). If you navigate away and back, `useMutationState` will return the previous mutation's status. The portal unmounts and remounts, so the badge reappears with the old status. Use `mutation.reset()` or a fresh `mutationKey` per session if you want clean state on revisit.
- **`useMutationState` returns all matching mutations** — if the same `mutationKey` is used across multiple mount/unmount cycles, the array grows. The `useFormStatus` hook takes the last entry, but this is worth understanding: the array is append-only for the lifetime of the QueryClient.
- **DOM/React tree mismatch** — inherits the portal approach's debugging quirk.
- **Client-only slot content** — inherits the portal approach's SSR limitation.

### Gotchas

- `useMutationState` was introduced in TanStack Query v5. If you're on v4 or earlier, this approach isn't available — you'd need the Zustand hybrid or a custom observer pattern.
- The `mutationKey` must be consistent between `useFormMutation` (which creates the mutation) and `useFormStatus` (which reads from the cache). A typo in either will silently break the link. The shared `FORM_MUTATION_KEY` constant prevents this, but it's a coupling point.
- `useMutationState` subscribes to _all_ mutations matching the filter. In a high-throughput scenario with many mutations sharing a key, the hook would re-render on every mutation state change. For a single form this is irrelevant, but it's a scaling consideration.
- The `PortalSlotProvider` still uses a lightweight React context to pass the target ID. This is static and causes no re-renders.

---

## Which Should You Use?

There isn't a universal answer — it depends on the shape of your app and what you're optimising for.

| | Context | Portal | Zustand | Hybrid (Zustand) | Hybrid (RQ) |
|---|---|---|---|---|---|
| **Provider needed at layout level** | Yes (two: form + slot) | No (page-scoped) | No (no provider) | No (ID-only) | No (ID-only) |
| **Extra dependencies** | None | None | `zustand` | `zustand` | None |
| **Re-render scope** | All provider children | Only portal content | Only selecting components | Portal + selectors | Portal + cache subscribers |
| **Layout knows about slot types** | No (arbitrary nodes) | No (arbitrary nodes) | Yes (closed switch) | No (arbitrary nodes) | No (arbitrary nodes) |
| **Slot cleanup on navigation** | useEffect unmount | Portal unmounts | useNavbarSlot unmount | Portal unmounts | Portal unmounts |
| **Adding a new navbar component** | New page only | New page only | New page + layout switch | New page only | New page only |
| **State lifetime** | Tied to provider mount | Tied to page mount | Singleton (cleared by hook) | Singleton (portal hides) | QueryClient lifetime |
| **Form page needs a provider** | No (layout-level) | Yes (page-level context) | No (store) | No (store) | No (cache) |
| **Sync layer needed** | No | No | useEffect → store | useEffect → store | No (direct cache read) |
| **SSR-compatible** | Yes | Partial (client-only) | Client components only | Partial (client-only) | Partial (client-only) |
| **Complexity** | Low–medium | Medium | Medium (two stores) | Medium (two mechanisms) | Low–medium |

**Context** is the right default when you want to stay within React's built-in primitives and the provider wrapping cost is acceptable. The `SlotContent` pattern gives pages declarative control over the slot without introducing external dependencies. The main cost is provider bloat — every route is wrapped in contexts it may not need.

**Portals** are the cleanest single-mechanism solution. Each page independently owns what appears in the layout, the layout is fully route-agnostic, and providers stay scoped to the pages that need them. The tradeoff is more infrastructure (target/inject/context plumbing) and the DOM/React tree mismatch that can complicate debugging. The form page still needs a page-level context provider to share mutation state between the form and the portalled badge.

**Zustand** is the pragmatic choice when you want to avoid provider hierarchies entirely and you're comfortable with a closed set of slot types. The layout must enumerate all possible components upfront, which re-introduces coupling — but the mount/unmount lifecycle is clean and the re-render characteristics are excellent. It's a good fit when the set of possible navbar states is small and stable.

**Hybrid (Portal + Zustand)** combines portals for open-ended slot injection with Zustand for provider-free mutation state. Each page uses only the mechanisms it needs. The cost is a larger conceptual surface area and the `zustand` dependency.

**Hybrid (Portal + React Query)** is the leanest complete solution. It achieves everything the Zustand hybrid does — open component set, no layout-level providers, scoped complexity — but without an extra dependency or sync layer. `useMutationState` reads directly from React Query's cache, which the app already maintains. If your app is already using TanStack Query v5, this is the approach with the fewest moving parts and the smallest conceptual surface area.
