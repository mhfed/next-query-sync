# Changelog

All notable user-visible changes to `next-query-sync` will be documented here.

The project follows semantic versioning for published package releases.

## Unreleased

### Added

- Add `parseAsStrictInteger` for complete base-10 safe-integer URL contracts without changing the existing `parseAsInteger` prefix behavior.
- Add `parseAsStrictFloat` for complete finite decimal/scientific-notation URL contracts without changing the existing `parseAsFloat` prefix behavior.
- Add explicit numeric parser semantics and edge-case/versioning documentation.

### Fixed

- Preserve URL hash fragments when search parameters are updated or cleared.
- Preserve non-null `ParserWithDefault<T>` semantics in `useQueryStates` types and server-side default parsing.
- Cancel pending debounced URL writes when a hook unmounts.
- Make debounced nullable updates optimistic when clearing a query value to `null`, while still delaying the URL write until the debounce interval expires.

### Deprecated

- `UseQueryStateOptions.startTransition` is retained for source compatibility but no longer promises non-blocking URL-store updates. URL state is exposed through `useSyncExternalStore`, so callers should not rely on this option as a concurrency/performance primitive.

### Maintenance

- Add automated typecheck, test, build, and package verification on pull requests.
- Add regression coverage for query batching, defaulted multi-state parsing, debounce cleanup, browser `popstate` restoration, optimistic debounced clearing, and strict numeric parser edge cases.
- Add compile-time public API contracts for nullable/defaulted hook values, setters, and strict numeric parser exports.
- Add CI compatibility gates for React 18.3 and React 19.2.
- Add a Next.js 16.2 LTS App Router fixture that installs the packed npm artifact and runs a production build.
- Add an explicit compatibility matrix describing continuously verified environments and remaining browser-level coverage.
- Stop tracking generated `packages/dist` build artifacts; clean clones now build before public declaration contract verification while CI reuses its existing build output.
- Add copy-paste App Router examples for debounced search, product filters/pagination, URL-backed tabs, and shareable modal state with explicit `push`/`replace` guidance.
- Rework the docs homepage and interactive examples around tested project behavior, removing unsupported competitor scorecards, bundle-size claims, stale version marketing, and `startTransition` performance claims.
- Align the npm README with the current compatibility/deprecation/parser contracts.
- Add a production docs build to CI after building the local `next-query-sync` package dependency from source.
- Add a read-only release-candidate workflow that validates an explicit git ref, packs the npm artifact, verifies it in the Next.js consumer, and uploads the tarball for maintainer inspection.
- Allow the guarded Codex release audit to check out and report the exact release-candidate ref.
- Add maintainer release documentation that keeps npm publication and Git tagging behind explicit human approval.
- Add contribution, security, pull-request, and bug-report guidance.
- Add repository-specific Codex review guidance and guarded PR/release-audit workflows.
