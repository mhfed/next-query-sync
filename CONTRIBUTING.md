# Contributing to next-query-sync

Thanks for helping improve `next-query-sync`.

## Development setup

The package lives in `packages/`.

```bash
cd packages
npm ci
npm run typecheck
npm test
npm run build
```

## Before opening a pull request

Please keep changes focused and include tests for behavior changes or bug fixes.

Run:

```bash
cd packages
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

## Pull request expectations

A good pull request should explain:

- the problem being solved;
- the intended behavior;
- any public API or compatibility impact;
- the tests added or updated.

Avoid unrelated refactors in bug-fix pull requests.

## Public API changes

Changes to exported hooks, parser behavior, TypeScript types, overloads, serialization, or history semantics may affect consumers. Call these out explicitly in the pull request description.

## Bug reports

When reporting URL or browser-history issues, include a minimal starting URL, the hook/parser configuration, the action performed, and the resulting URL/state.

## Security issues

Please do not open a public issue for a suspected security vulnerability. Follow the instructions in `SECURITY.md` instead.
