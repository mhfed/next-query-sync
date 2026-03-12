# nuqschim

> A lightweight, **type-safe** URL search params state manager for Next.js — built with React 18 Concurrent Mode and production performance in mind.

## Features

- 🔒 **Type-safe**: TypeScript infers exact output types from your parser schema
- ⚡ **Batched updates**: multiple param changes in one event loop → one `history` call
- 🌐 **SSR-safe**: no crashes on the server (`window` guard throughout)
- 🔄 **React 18 ready**: uses `useSyncExternalStore` — no UI tearing in Concurrent Mode
- 📦 **Dual package**: ships both CJS and ESM builds with `.d.ts` typings
- 🪶 **Zero runtime deps**: only a React 18+ peer dependency

---

## Install

```bash
npm install nuqschim
# or
pnpm add nuqschim
```

---

## Quick Start (Next.js App Router)

```tsx
'use client'
import { useQueryState, parseAsInteger, withDefault } from 'nuqschim'
import { Suspense } from 'react'

function ProductList() {
  const [page, setPage] = useQueryState(
    'page',
    withDefault(parseAsInteger, 1),
    { history: 'push' }   // creates browser history entries → Back button works
  )

  return (
    <div>
      <h1>Page: {page}</h1>
      <button onClick={() => setPage(p => p + 1)}>Next →</button>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
    </div>
  )
}

// ⚠️ Next.js App Router: wrap in Suspense when reading URL params
export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ProductList />
    </Suspense>
  )
}
```

---

## API Reference

### `useQueryState(key, parser, options?)`

Syncs a single URL search param with React state.

```ts
const [value, setValue] = useQueryState(key, parser, options?)
```

| Param | Type | Description |
|---|---|---|
| `key` | `string` | URL search param name |
| `parser` | `Parser<T>` | Determines how to parse/serialize the value |
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

Implement the `Parser<T>` interface for any custom type:

```ts
import type { Parser } from 'nuqschim'

const parseAsDate: Parser<Date> = {
  parse: (v) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  },
  serialize: (d) => d.toISOString().split('T')[0]!,
}
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

Every access to `window` is guarded by `typeof window === 'undefined'`. `useSyncExternalStore`'s `getServerSnapshot` always returns `null`, so the hook renders correctly on the server without hydration mismatches.

### React 18 Concurrent Mode

`useSyncExternalStore` (React 18+) ensures that all components reading the same URL param see a **consistent snapshot** — no tearing when React interrupts and restarts renders.

---

## License

MIT
