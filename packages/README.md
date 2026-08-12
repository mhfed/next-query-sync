# next-query-sync

> A small, type-safe URL search params state manager for React and Next.js.

## What it provides

- Primitive-default inference: `useQueryState('page', 1)` → `number`
- Explicit parser contracts and `.withDefault()` nullability
- Batched synchronous URL writes
- Optimistic debounce for high-frequency state
- `push` / `replace` history intent plus Back/Forward subscriptions
- SSR-aware browser guards
- CJS, ESM and TypeScript declarations
- React 18+ peer dependency; Zod is optional

## Install

```bash
npm install next-query-sync
```

## Quick start

```tsx
'use client'

import { useQueryState } from 'next-query-sync'

export function Pagination() {
  const [page, setPage] = useQueryState('page', 1, {
    history: 'push',
  })

  return (
    <>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
      <span>Page {page}</span>
      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </>
  )
}
```

## `useQueryState`

```ts
const [value, setValue] = useQueryState(key, parserOrDefault, options?)
```

The second argument can be:

- a primitive default (`string`, `number`, `boolean`)
- a `Parser<T>` / `ParserWithDefault<T>`
- a supported Zod schema

Options:

| Option | Contract |
|---|---|
| `history` | `'replace'` by default, or `'push'` for intentional browser-history entries |
| `debounce` | delays the URL write while exposing optimistic pending state |
| `startTransition` | **deprecated compatibility option**; accepted but ignored, with no non-blocking external-store guarantee |

### Primitive defaults

```ts
const [count, setCount] = useQueryState('count', 0)       // number
const [query, setQuery] = useQueryState('q', '')          // string
const [active, setActive] = useQueryState('active', false) // boolean
```

When the next value equals the primitive default, the query key is removed for a cleaner URL.

### Explicit parsers

```ts
import { parseAsInteger, parseAsString, useQueryState } from 'next-query-sync'

const [page, setPage] = useQueryState(
  'page',
  parseAsInteger.withDefault(1),
)
// page: number

const [query, setQuery] = useQueryState('q', parseAsString)
// query: string | null
```

### Debounce

```ts
const [query, setQuery] = useQueryState('q', '', {
  debounce: 300,
})
```

The hook value changes optimistically; the URL mutation waits for the debounce interval. Pending timers are cancelled when the hook unmounts.

## `useQueryStates`

```ts
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
  withDefault,
} from 'next-query-sync'

const [filters, setFilters] = useQueryStates({
  page: withDefault(parseAsInteger, 1),
  q: parseAsString,
})

setFilters({ page: 2, q: 'react' })
// keys changed by one setter call enter the same URL batch
```

## Numeric parser contracts

The original numeric exports keep their published JavaScript prefix semantics for backward compatibility:

```ts
parseAsInteger.parse('42px') // 42
parseAsFloat.parse('1.5rem') // 1.5
```

For new URL contracts that should validate the complete value, use the strict variants:

```ts
import {
  parseAsStrictFloat,
  parseAsStrictInteger,
} from 'next-query-sync'

parseAsStrictInteger.parse('42')   // 42
parseAsStrictInteger.parse('42px') // null
parseAsStrictInteger.parse('3.14') // null

parseAsStrictFloat.parse('1.5')    // 1.5
parseAsStrictFloat.parse('1e3')    // 1000
parseAsStrictFloat.parse('1.5rem') // null
parseAsStrictFloat.parse('Infinity') // null
```

`parseAsStrictInteger` accepts complete base-10 values inside JavaScript's safe-integer range. Its serializer throws for non-safe-integers.

`parseAsStrictFloat` accepts complete finite decimal/scientific-notation values. Its serializer throws for `NaN` or infinity.

## Built-in parsers

| Parser | Contract |
|---|---|
| `parseAsString` | raw string / `null` |
| `parseAsInteger` | `parseInt` prefix semantics (compatibility) |
| `parseAsFloat` | `parseFloat` prefix semantics (compatibility) |
| `parseAsStrictInteger` | complete safe base-10 integer |
| `parseAsStrictFloat` | complete finite decimal/scientific number |
| `parseAsBoolean` | `true` / `false` only |
| `parseAsIsoDateTime` | valid `Date` or `null` |
| `parseAsArrayOf(parser)` | separator-delimited values |

All built-in parsers support `.withDefault(value)`.

## Custom parsers

Use `makeParser` to attach the full parser contract, including `.withDefault()`:

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

## Compatibility / maintenance

The repository CI continuously checks Node 20/22, React 18.3/19.2, generated public declarations, package contents, a packed Next.js App Router consumer, and the production docs build.

The project repository also contains explicit compatibility, parser-semantics, contributing, security and release-process documentation.

## License

MIT
