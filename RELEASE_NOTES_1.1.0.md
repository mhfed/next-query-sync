# next-query-sync 1.1.0 release notes

This document is the release-candidate summary for 1.1.0. It does not indicate that the package has already been published.

## User-visible highlights

### Strict numeric URL contracts

1.1.0 adds opt-in parsers for applications that need complete numeric validation:

```ts
import {
  parseAsStrictFloat,
  parseAsStrictInteger,
} from 'next-query-sync'

parseAsStrictInteger.parse('42')    // 42
parseAsStrictInteger.parse('42px')  // null
parseAsStrictFloat.parse('1e3')     // 1000
parseAsStrictFloat.parse('1.5rem')  // null
```

The existing `parseAsInteger` and `parseAsFloat` exports keep their published JavaScript prefix-parsing behavior, so this feature is additive rather than a silent URL-semantics change.

### More consistent query-state correctness

- URL search-param writes preserve `#hash` fragments.
- `ParserWithDefault<T>` inside `useQueryStates` is typed as `T`, matching runtime behavior.
- Debounced timers are cancelled on unmount.
- Debounced nullable clears become optimistic immediately while the URL write remains delayed.
- Browser `popstate` restoration has explicit regression coverage for nullable/defaulted single and multi-state hooks.

### `startTransition` compatibility option deprecated

`UseQueryStateOptions.startTransition` is still accepted so existing callers compile, but it is deprecated and ignored. Consumers should remove it when convenient and should not treat it as a non-blocking external-store guarantee.

See `MIGRATION.md` for the 1.0.1 → 1.1.0 notes.

## Compatibility evidence

The release branch is expected to pass the same deterministic gates as `main`:

- Node 20 and Node 22 quality matrix
- React 18.3 and React 19.2 compatibility matrix
- public declaration contracts
- all public TSX examples compiled against generated declarations
- npm package-content verification
- packed-package Next.js 16.2 LTS App Router production build
- docs production build
- consumer dependency audit at high+ severity
- full maintainer-tree audit at critical severity

## Dependency security baseline

The consumer audit reports zero vulnerabilities at the configured high+ threshold.

Before the pre-release toolchain remediation, the development tree contained 9 npm audit findings, including one critical. Vitest was upgraded to 4.1.10 and the lockfile refreshed without a forced audit migration. The resulting release baseline has no high/critical audit blockers under the configured gates and retains one documented low-severity development-only esbuild advisory.

See `DEPENDENCY_SECURITY.md` for the dependency path, advisory identifier, and release policy.

## Maintainer release boundary

This release-prep branch intentionally does not:

- publish to npm
- create a Git tag
- create a GitHub Release
- add npm credentials
- grant Codex or any automation release authority

The read-only release-candidate workflow can verify an explicit ref and produce a tarball artifact for inspection. Publication remains a separate maintainer action.
