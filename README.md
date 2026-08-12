# next-query-sync

> A lightweight, **type-safe** URL search params state manager for Next.js — built around React's external-store model and a deliberately small API.

## Features

- 🔒 **Type-safe**: TypeScript infers exact output types from your parser schema
- ⚡ **Batched updates**: multiple param changes in one event loop → one `history` call
- 🌐 **SSR-aware**: browser globals are guarded and defaulted parsers keep stable server values
- 🔄 **React 18+ ready**: uses `useSyncExternalStore` for consistent URL snapshots
- 📦 **Dual package**: ships both CJS and ESM builds with `.d.ts` typings
- 🪶 **Zero runtime dependencies**: React 18+ is a peer; Zod is an optional peer for schema integration

---

## Install

```bash
npm install next-query-sync
# or
pnpm add next-query-sync
```

## Compatibility

CI verifies the published package shape and public types on Node 20/22, React 18.3 and React 19.2, plus a packed-package build inside a Next.js 16.2 LTS App Router fixture.

See [`COMPATIBILITY.md`](./COMPATIBILITY.md) for what is continuously tested and what remains outside the compatibility guarantee.

---

## Quick Start (Next.js App Router)

```tsx
'use client'
import { useQueryState } from 'next-query-sync'

export default function ProductList() {
  const [page, setPage] = useQueryState(
    'page',
    1,
    { history: 'push' } // creates intentional history entries
  )

  return (
    <div>
      <h1>Page: {page}</h1>
      <button onClick={() => setPage(p => p + 1)}>Next →</button>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
    </div>
  )
}
```

## Real-world examples

The [`examples/`](./examples) directory contains copy-paste App Router patterns with explicit URL and history semantics:

- [Debounced search](./examples/debounced-search.tsx) — `?q=react`
- [Product catalog filters + pagination](./examples/product-catalog.tsx) — `?page=2&sort=price&inStock=true`
- [URL-backed tabs](./examples/url-tabs.tsx) — `?tab=activity`
- [Shareable modal/detail state](./examples/shareable-modal.tsx) — `?item=sku-42`

Use `replace` for high-frequency state where intermediate history entries are noise, and `push` for state changes users reasonably expect Back/Forward to traverse. See the examples index for the tradeoffs.

---

## API Reference

### `useQueryState(key, parserOrDefault, options?)`

Syncs a single URL search param with React state. The second argument can be a primitive default, a built-in/custom parser, or a supported Zod schema.

```ts
const [value, setValue] = useQueryState(key, parserOrDefault, options?)
```

| Param | Type | Description |
|---|---|---|
| `key` | `string` | URL search param name |
| `parserOrDefault` | `Primitive \| Parser<T> \| ZodLike<T>` | Determines parsing/default behavior |
| `options.history` | `'push' \| 'replace'` | Default: `'replace'` |

```tsx
const [search, setSearch] = useQueryState('q', parseAsString)
// search: string | null
// setSearch('hello')        → ?q=hello
// setSearch(null)           → removes ?q from URL
// setSearch(v => v + '!')   → functional updater
```

---

### `useQueryStates(schema, options?)`

Syncs multiple URL params at once. All updates in one `setValues` call are coalesced into a **single URL write**.

```tsx
const [params, setParams] = useQueryStates({
  page:   withDefault(parseAsInteger, 1),
  search: parseAsString,
  tags:   parseAsArrayOf(parseAsString),
})

// params.page   → number       (default: 1, never null)
// params.search → string | null
// params.tags   → string[] | null

setParams({ page: 2, search: 'react' })  // single history entry
```

---

### Built-in Parsers

| Parser | URL value | JS value |
|---|---|---|
| `parseAsString` | `"hello"` | `"hello"` |
| `parseAsInteger` | `"42"` | `42` |
| `parseAsFloat` | `"3.14"` | `3.14` |
| `parseAsBoolean` | `"true"` / `"false"` | `true` / `false` |
| `parseAsArrayOf(p)` | `"a,b,c"` | `["a","b","c"]` |

---

### `withDefault(parser, defaultValue)`

Wraps any parser so that missing/unparseable values return `defaultValue` instead of `null`. TypeScript will narrow the return type to `T` (no null).

```ts
const pageParser = withDefault(parseAsInteger, 1)
// pageParser.parse(null) → 1
// pageParser.parse('5')  → 5

const [page, setPage] = useQueryState('page', pageParser)
// page: number  ← TypeScript knows this is never null
```

---

### Custom Parsers

Use `makeParser` to create a parser with the same `.withDefault()` contract as the built-ins:

```ts
import { makeParser } from 'next-query-sync'

const parseAsDate = makeParser<Date>(
  (value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  },
  (date) => date.toISOString().split('T')[0]!
)

const dateWithDefault = parseAsDate.withDefault(new Date('2026-01-01'))
```

---

## How It Works

### Batching

`queueMicrotask` is used to defer the actual `history.replaceState` / `history.pushState` call. Multiple synchronous updates (e.g. calling `setPage(2)` and `setSearch('react')` in the same handler) are merged into **one URL write**:

```
Event handler
  setPage(2)      → scheduleUrlUpdate('page', '2')   ─┐ same microtask batch
  setSearch('q')  → scheduleUrlUpdate('search', 'q') ─┘
                                                        ↓
                                             history.replaceState(…?page=2&search=q)
```

### SSR Safety

Browser access is guarded so importing and rendering the hooks does not require `window` during server execution. Defaulted parsers are evaluated against the server snapshot as well, keeping their non-null runtime contract on the server.

The Next.js integration fixture in CI server-renders an App Router page containing a client component that imports the **packed npm artifact**, which catches accidental source-only imports and common SSR/build regressions.

### React external-store model

`useSyncExternalStore` (React 18+) keeps components reading URL state on a consistent external snapshot. CI exercises both React 18 and React 19 compatibility targets.

---

## License

MIT
