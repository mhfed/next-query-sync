# next-query-sync

> A lightweight, **type-safe** URL search params state manager for Next.js — built around React's external-store model and a deliberately small API.

## Features

- 🔒 **Type-safe**: TypeScript infers output/nullability from primitive defaults and parser contracts
- ⚡ **Batched updates**: synchronous param changes are coalesced before a history write
- 🔎 **Optimistic debounce**: hook state can update immediately while URL writes wait for the debounce interval
- ↩️ **History-aware**: `push` / `replace` intent plus `popstate` Back/Forward subscriptions
- 🌐 **SSR-aware**: browser globals are guarded and a packed Next.js App Router consumer builds in CI
- 📦 **Dual package**: ships CJS, ESM and `.d.ts` typings
- 🪶 **No regular runtime dependencies**: React 18+ is a peer; Zod is an optional peer

---

## Install

```bash
npm install next-query-sync
# or
pnpm add next-query-sync
```

## Compatibility

CI verifies the package shape and public types on Node 20/22, React 18.3 and React 19.2, plus a packed-package build inside a Next.js 16.2 LTS App Router fixture, public example typechecks, and a production build of the docs application.

See [`COMPATIBILITY.md`](./COMPATIBILITY.md) for the continuously tested surface. If you are upgrading from 1.0.1, see [`MIGRATION.md`](./MIGRATION.md) for the planned 1.1.0 compatibility notes.

---

## Quick Start

```tsx
'use client'
import { useQueryState } from 'next-query-sync'

export default function ProductList() {
  const [page, setPage] = useQueryState('page', 1, {
    history: 'push',
  })

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

The [`examples/`](./examples) directory contains copy-paste App Router patterns with explicit URL/history semantics:

- [Debounced search](./examples/debounced-search.tsx) — `?q=react`
- [Product catalog filters + pagination](./examples/product-catalog.tsx) — `?page=2&sort=price&inStock=true`
- [URL-backed data table](./examples/data-table.tsx) — `?q=usb&sort=price&direction=desc&page=2`
- [URL-backed tabs](./examples/url-tabs.tsx) — `?tab=activity`
- [Shareable modal/detail state](./examples/shareable-modal.tsx) — `?item=sku-42`

Use `replace` for high-frequency state where intermediate history entries are noise, and `push` for changes users reasonably expect Back/Forward to traverse.

---

## API Reference

### `useQueryState(key, parserOrDefault, options?)`

The second argument can be a primitive default, a built-in/custom parser, or a supported Zod schema.

| Param | Type | Description |
|---|---|---|
| `key` | `string` | URL search param name |
| `parserOrDefault` | `Primitive \| Parser<T> \| ZodLike<T>` | Determines parsing/default behavior |
| `options.history` | `'push' \| 'replace'` | Default: `'replace'` |
| `options.debounce` | `number` | Delay URL writes while exposing optimistic pending state |
| `options.startTransition` | `boolean` | **Deprecated compatibility option.** Accepted but ignored; do not rely on it for non-blocking external-store updates |

```tsx
const [search, setSearch] = useQueryState('q', parseAsString)
// search: string | null
// setSearch('hello') → ?q=hello
// setSearch(null)    → removes q

const [query, setQuery] = useQueryState('q', '', { debounce: 300 })
// query changes immediately; URL write waits 300 ms
```

### `useQueryStates(schema, options?)`

Sync multiple URL params from one parser schema. Keys changed by one `setValues` call enter the same URL batch.

```tsx
const [params, setParams] = useQueryStates({
  page: withDefault(parseAsInteger, 1),
  search: parseAsString,
  tags: parseAsArrayOf(parseAsString),
})

// params.page   → number
// params.search → string | null
// params.tags   → string[] | null

setParams({ page: 2, search: 'react' })
```

---

## Built-in parsers

| Parser | Contract |
|---|---|
| `parseAsString` | raw string / `null` |
| `parseAsInteger` | backward-compatible `parseInt` prefix semantics |
| `parseAsFloat` | backward-compatible `parseFloat` prefix semantics |
| `parseAsStrictInteger` | complete base-10 **safe integer** only |
| `parseAsStrictFloat` | complete finite decimal / scientific-notation number only |
| `parseAsBoolean` | only `"true"` / `"false"` |
| `parseAsIsoDateTime` | valid `Date` from a date-time string |
| `parseAsArrayOf(p)` | separator-delimited values parsed by `p` |

For new numeric URL contracts where `42px` should be rejected rather than interpreted as a numeric prefix, use the strict parsers:

```ts
parseAsInteger.parse('42px')       // 42 (legacy compatibility)
parseAsStrictInteger.parse('42px') // null

parseAsFloat.parse('1.5rem')       // 1.5 (legacy compatibility)
parseAsStrictFloat.parse('1.5rem') // null
```

`parseAsStrictInteger` rejects values outside JavaScript's safe-integer range. Its serializer throws for non-safe-integers. `parseAsStrictFloat` rejects non-finite values and its serializer throws for `NaN` / `±Infinity`.

See [`PARSER_SEMANTICS.md`](./PARSER_SEMANTICS.md) for the accepted grammar, edge cases and versioning rationale.

### Defaults

Every parser supports `.withDefault(value)`:

```ts
const pageParser = parseAsStrictInteger.withDefault(1)

pageParser.parse(null)     // 1
pageParser.parse('5')      // 5
pageParser.parse('5px')    // 1

const [page, setPage] = useQueryState('page', pageParser)
// page: number (never null)
```

The standalone `withDefault(parser, value)` helper remains available for backward compatibility.

### Custom parsers

Prefer `makeParser` so the required `.withDefault()` contract is attached automatically:

```ts
import { makeParser } from 'next-query-sync'

const parseAsDate = makeParser<Date>(
  value => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  },
  date => date.toISOString().slice(0, 10),
)
```

---

## How it works

### Batching

`queueMicrotask` defers the history mutation so synchronous updates can be coalesced:

```text
setPage(2)      ─┐
setSearch('q')  ─┴─> one history write for the batch
```

### SSR / package boundary

Browser access is guarded during server execution. CI also builds a Next.js App Router fixture that installs the **packed npm artifact**, which catches accidental source-only imports and common package/SSR build regressions.

### React external-store model

`useSyncExternalStore` keeps URL readers subscribed to the same external snapshot. CI exercises React 18 and React 19 targets, plus explicit `popstate` regression coverage.

---

## Maintainer docs

- [`COMPATIBILITY.md`](./COMPATIBILITY.md)
- [`MIGRATION.md`](./MIGRATION.md)
- [`PARSER_SEMANTICS.md`](./PARSER_SEMANTICS.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`SECURITY.md`](./SECURITY.md)
- [`RELEASING.md`](./RELEASING.md)
- [`ROADMAP.md`](./ROADMAP.md)

## License

MIT
