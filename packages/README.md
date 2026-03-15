# next-query-sync

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
npm install next-query-sync
# or
pnpm add next-query-sync
```

---

## Quick Start (Next.js App Router)

```tsx
'use client'
import { useQueryState, parseAsInteger } from 'next-query-sync'
import { Suspense } from 'react'

function ProductList() {
  // Method chaining — preferred style
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
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

### `useQueryState(key, parserOrDefault, options?)`

Syncs a single URL search param with React state. Supports four calling styles:

```ts
const [value, setValue] = useQueryState(key, parserOrDefault, options?)
```

| Param | Type | Description |
|---|---|---|
| `key` | `string` | URL search param name |
| `parserOrDefault` | `Parser<T>` \| `ParserWithDefault<T>` \| `Primitive` \| Zod schema | Determines how to parse/serialize the value |
| `options.history` | `'push' \| 'replace'` | Default: `'replace'` |
| `options.debounce` | `number` | Debounce URL writes by N ms (optimistic UI while typing) |
| `options.startTransition` | `boolean` | Wrap URL writes in `React.startTransition` (non-urgent updates) |

**Style 1 — Primitive default (auto-inference, like `useState`):**
```tsx
const [count, setCount]   = useQueryState('count', 0)      // number, never null
const [search, setSearch] = useQueryState('search', '')    // string, never null
const [active, setActive] = useQueryState('active', false) // boolean, never null
```

**Style 2 — Method chaining (preferred):**
```tsx
const [page, setPage]   = useQueryState('page', parseAsInteger.withDefault(1))
const [date, setDate]   = useQueryState('date', parseAsIsoDateTime.withDefault(new Date()))
const [q, setQ]         = useQueryState('q', parseAsString)  // string | null
```

**Style 3 — Zod schema:**
```tsx
import { z } from 'zod'
const FilterSchema = z.object({
  role:   z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'banned']),
}).default({ role: 'user', status: 'active' })

// Pass the schema directly — no wrapper needed
const [filter, setFilter] = useQueryState('filter', FilterSchema)
// filter: { role: 'admin' | 'user' | 'guest'; status: 'active' | 'banned' }
//         → never null, always validated
// URL: ?filter=%7B%22role%22%3A%22admin%22%7D  (auto JSON-encoded)
// Tampered / invalid URL → silently falls back to .default({...})

setFilter(f => ({ ...f, role: 'admin' }))
```

**Style 4 — Debounce + startTransition (ideal for search inputs):**
```tsx
const [q, setQ] = useQueryState('q', '', { debounce: 300, startTransition: true })
```

---

### `useQueryStates(schema, options?)`

Syncs multiple URL params at once. All updates in one `setValues` call are coalesced into a **single URL write**.

| Param | Type | Description |
|---|---|---|
| `schema` | `Record<string, Parser<T>>` | Map of key → parser |
| `options.history` | `'push' \| 'replace'` | Default: `'replace'` |

```tsx
import { useQueryStates, parseAsString, parseAsInteger, withDefault } from 'next-query-sync'

function ProductFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      sort:   withDefault(parseAsString,  'latest'),
      page:   withDefault(parseAsInteger, 1),
      search: parseAsString,
    },
    { history: 'push' }  // each setFilters() call → one history entry
  )
  // filters.sort   → string        (default: 'latest', never null)
  // filters.page   → number        (default: 1, never null)
  // filters.search → string | null

  // Changing sort resets page — still one history entry:
  const handleSort = (sort: string) => setFilters({ sort, page: 1 })
}
```

---

### Built-in Parsers

| Parser | URL value | JS value |
|---|---|---|
| `parseAsString` | `"hello"` | `"hello"` |
| `parseAsInteger` | `"42"` | `42` |
| `parseAsFloat` | `"3.14"` | `3.14` |
| `parseAsBoolean` | `"true"` / `"false"` | `true` / `false` |
| `parseAsIsoDateTime` | `"2026-03-16T09:00:00.000Z"` | `Date` |
| `parseAsArrayOf(p)` | `"a,b,c"` | `["a","b","c"]` |

All parsers return `null` for missing/unparseable values. Chain `.withDefault(value)` to eliminate null:

```ts
// Every built-in parser supports .withDefault()
parseAsString.withDefault('')
parseAsInteger.withDefault(1)
parseAsFloat.withDefault(0.0)
parseAsBoolean.withDefault(false)
parseAsIsoDateTime.withDefault(new Date())
parseAsArrayOf(parseAsString).withDefault([])

// Re-chain to override the default value:
parseAsInteger.withDefault(1).withDefault(99)  // → default is 99
```

---

### `withDefault(parser, defaultValue)`

Wraps any parser so that missing/unparseable values return `defaultValue` instead of `null`. TypeScript will narrow the return type to `T` (no null).

> **Preferred:** use the `.withDefault()` method directly on any parser — it is equivalent and reads better:

```ts
// Method chaining (preferred)
const pageParser = parseAsInteger.withDefault(1)

// HOF style (still supported, kept for backward compatibility)
const pageParser = withDefault(parseAsInteger, 1)

// Both are equivalent:
// pageParser.parse(null) → 1
// pageParser.parse('5')  → 5

const [page, setPage] = useQueryState('page', pageParser)
// page: number  ← TypeScript knows this is never null
```

---

### Custom Parsers

Use `makeParser` to create a fully-typed parser with `.withDefault()` support automatically attached:

```ts
import { makeParser } from 'next-query-sync'

const parseAsDate = makeParser<Date>(
  (v) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  },
  (d) => d.toISOString().split('T')[0]!
)

// Method chaining works out of the box:
const [date, setDate] = useQueryState('date', parseAsDate.withDefault(new Date()))
```

Alternatively, implement the `Parser<T>` interface directly:

```ts
import type { Parser } from 'next-query-sync'

const parseAsDate: Parser<Date> = {
  parse: (v) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  },
  serialize: (d) => d.toISOString().split('T')[0]!,
  withDefault: (defaultValue) => ({
    parse: (v) => parseAsDate.parse(v) ?? defaultValue,
    serialize: parseAsDate.serialize,
    withDefault: parseAsDate.withDefault,
    defaultValue,
  }),
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
