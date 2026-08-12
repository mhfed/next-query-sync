# AGENTS.md

This repository contains `next-query-sync`, a small TypeScript library for synchronizing URL search parameters with React state.

## Review priorities

When reviewing changes, prioritize correctness and compatibility over stylistic suggestions.

### URL integrity

Every query update must preserve:

- the current pathname;
- unrelated search parameters;
- the current hash fragment.

`history: 'replace'` must not create a new navigation entry. `history: 'push'` must create an intentional history entry.

### Parser invariants

For supported values, parser serialization and parsing should be stable and unsurprising.

`Parser<T>` may return `null` for absent or invalid input.

`ParserWithDefault<T>` must return `T`, never `null`, including when the URL value is absent or invalid.

### Type-safety invariants

Runtime default semantics and public TypeScript types must agree.

A defaulted parser used with `useQueryState` or `useQueryStates` must expose a non-null value and a non-null setter/updater contract.

Changes to exported functions, types, parser behavior, or overloads should be treated as potential public API changes.

### SSR and React invariants

Browser globals must not be evaluated in server-only execution paths.

Do not introduce hydration behavior that disagrees with parser defaults.

`useSyncExternalStore` subscriptions must remain deterministic and free of avoidable tearing.

Pending debounced work must not mutate the URL after the owning hook has unmounted.

### Tests

Behavioral bug fixes should include a regression test.

Prefer deterministic tests for parsing, history behavior, batching, SSR-safe defaults, hash preservation, and type inference. Do not ask Codex to replace deterministic lint, typecheck, build, or unit-test jobs.

## Scope discipline

Keep the package deliberately small. Avoid adding dependencies or framework abstractions unless they materially improve the core URL-state use case.

Do not make unrelated formatting or API changes in a bug-fix pull request.
