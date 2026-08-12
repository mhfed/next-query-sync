# Migration guide

## 1.0.1 → 1.1.0

The planned 1.1.0 release is designed as a backward-compatible minor release. Most applications do not need a code change before upgrading.

This guide documents the behavior fixes, deprecation, and additive parser API so consumers can decide whether to opt into the new contracts.

## Required changes

None for ordinary existing `useQueryState`, `useQueryStates`, `parseAsInteger`, or `parseAsFloat` usage.

The existing numeric parsers deliberately keep their published prefix-parsing behavior in 1.1.x.

## `startTransition` option

`UseQueryStateOptions.startTransition` remains accepted so existing code continues to compile, but it is deprecated and ignored at runtime.

Before:

```ts
const [query, setQuery] = useQueryState('q', '', {
  debounce: 300,
  startTransition: true,
})
```

Recommended in 1.1:

```ts
const [query, setQuery] = useQueryState('q', '', {
  debounce: 300,
})
```

Removing the property is optional for compatibility, but recommended so application code does not imply a non-blocking external-store guarantee that the option cannot provide.

## Debounced nullable clears

For nullable parsers, clearing a debounced value now updates the hook optimistically to `null` instead of leaving the previous value visible until the URL timer fires.

```ts
const [query, setQuery] = useQueryState('q', parseAsString, {
  debounce: 300,
})

setQuery(null)
// 1.1: query becomes null immediately
// URL removal still waits for the debounce interval
```

This is a correctness fix. If an application intentionally depended on the old delayed UI value, move that delay into application state explicitly rather than relying on the previous inconsistency.

## URL hash preservation

Updating or clearing search params now preserves the existing URL hash fragment.

```text
/docs?page=1#installation
       ↓ setPage(2)
/docs?page=2#installation
```

No migration is required.

## `useQueryStates` defaulted parser types

A `ParserWithDefault<T>` inside `useQueryStates` now exposes `T` rather than `T | null`, matching its runtime contract.

```ts
const [params] = useQueryStates({
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
})

// 1.1 contract:
// params.page -> number
// params.q    -> string | null
```

Code that added unnecessary null handling for `params.page` can simplify it, but existing null-safe code may remain unchanged.

## Strict numeric parsers are opt-in

The existing exports remain compatibility parsers:

```ts
parseAsInteger.parse('42px') // 42
parseAsFloat.parse('1.5rem') // 1.5
```

If your URL is an input-validation boundary and the entire value must be numeric, opt into the new strict parsers:

```ts
import {
  parseAsStrictFloat,
  parseAsStrictInteger,
} from 'next-query-sync'

parseAsStrictInteger.parse('42px') // null
parseAsStrictFloat.parse('1.5rem') // null
```

`parseAsStrictInteger` accepts complete base-10 safe integers. `parseAsStrictFloat` accepts complete finite decimal/scientific notation values.

See `PARSER_SEMANTICS.md` for the exact accepted grammar and serialization rules.

## Release checklist for consumers

Before upgrading a production application:

1. Remove `startTransition: true` where present, or accept the deprecation temporarily.
2. Decide whether any externally controlled numeric query params should opt into strict parsers.
3. Run application tests involving browser Back/Forward and debounced search inputs.
4. Verify shared/bookmarked URLs that contain application-specific numeric formats.

The project itself continuously checks Node 20/22, React 18/19, public declarations, a packed Next.js App Router consumer, package contents, examples, and the docs production build before release candidates are produced.
