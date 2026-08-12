# Changelog

All notable user-visible changes to `next-query-sync` will be documented here.

The project follows semantic versioning for published package releases.

## Unreleased

### Fixed

- Preserve URL hash fragments when search parameters are updated or cleared.
- Preserve non-null `ParserWithDefault<T>` semantics in `useQueryStates` types and server-side default parsing.
- Cancel pending debounced URL writes when a hook unmounts.

### Maintenance

- Add automated typecheck, test, build, and package verification on pull requests.
- Add regression coverage for query batching, defaulted multi-state parsing, and debounce cleanup.
- Add compile-time public API contracts for nullable/defaulted hook values and setters.
- Add CI compatibility gates for React 18.3 and React 19.2.
- Add a Next.js 16.2 LTS App Router fixture that installs the packed npm artifact and runs a production build.
- Add an explicit compatibility matrix describing continuously verified environments and remaining browser-level coverage.
- Add contribution, security, pull-request, and bug-report guidance.
- Add repository-specific Codex review guidance and guarded PR/release-audit workflows.
