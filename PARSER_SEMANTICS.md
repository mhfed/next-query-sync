# Numeric parser semantics

`next-query-sync` keeps URL parsing behavior explicit so changing parser strictness does not silently reinterpret existing links.

## Why there are legacy and strict numeric parsers

`parseAsInteger` and `parseAsFloat` shipped with JavaScript `parseInt` / `parseFloat` prefix behavior. Existing consumers may therefore rely on values such as `42px` parsing as `42`.

Tightening those existing exports in a minor release would change the meaning of already-valid application URLs. They remain compatibility parsers for the current major version.

For new URL contracts that should validate the complete value, prefer `parseAsStrictInteger` or `parseAsStrictFloat`.

## Integer contracts

| Input | `parseAsInteger` | `parseAsStrictInteger` |
| --- | ---: | ---: |
| `42` | `42` | `42` |
| `-12` | `-12` | `-12` |
| `+7` | `7` | `7` |
| `0012` | `12` | `12` |
| `42px` | `42` | `null` |
| `3.14` | `3` | `null` |
| `1e3` | `1` | `null` |
| `0x10` | `0` | `null` |
| ` 12` | `12` | `null` |
| value outside the safe-integer range | implementation numeric result | `null` |

`parseAsStrictInteger` accepts only a complete base-10 integer string matching an optional sign followed by digits. Parsed values must also satisfy `Number.isSafeInteger`.

Its serializer accepts only safe integers and throws `RangeError` otherwise. This prevents a strict parser from silently serializing a value it cannot faithfully parse back.

## Float contracts

| Input | `parseAsFloat` | `parseAsStrictFloat` |
| --- | ---: | ---: |
| `3.14` | `3.14` | `3.14` |
| `.5` | `0.5` | `0.5` |
| `1.` | `1` | `1` |
| `1e3` | `1000` | `1000` |
| `-2.5E-2` | `-0.025` | `-0.025` |
| `1.2px` | `1.2` | `null` |
| `0x10` | `0` | `null` |
| ` 1.2` | `1.2` | `null` |
| `Infinity` | `Infinity` | `null` |
| `NaN` | `null` | `null` |

`parseAsStrictFloat` accepts a complete signed decimal value, optionally with scientific notation. The parsed result must be finite.

Its serializer rejects `NaN`, `Infinity`, and `-Infinity` with `RangeError` so serialized output stays inside the parser's documented grammar.

## Defaults

All numeric parsers support `.withDefault()`:

```ts
import { parseAsStrictInteger, useQueryState } from 'next-query-sync'

const [page, setPage] = useQueryState(
  'page',
  parseAsStrictInteger.withDefault(1),
)

// ?page=2     -> 2
// ?page=2px   -> 1
// no page key -> 1
```

The default changes nullability, not grammar: rejected URL input falls back to the supplied default instead of becoming `null`.

## Versioning rule

Changing the accepted grammar of an existing parser can change the meaning of persisted or shared URLs. Such changes should be treated as compatibility-sensitive and documented explicitly rather than bundled into unrelated fixes.
