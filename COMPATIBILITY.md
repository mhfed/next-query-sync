# Compatibility

`next-query-sync` keeps a broad React peer range, but the project distinguishes between the **declared support range** and the versions that CI continuously verifies.

## Continuously verified targets

| Area | CI target | What is checked |
|---|---|---|
| Node.js | 20, 22 | install, TypeScript, unit tests, build, public declaration contracts, package contents |
| React | 18.3.1 | hooks/unit suite, build, public API type contracts with React 18 types |
| React | 19.2.0 | hooks/unit suite, build, public API type contracts with React 19 types |
| Next.js App Router | 16.2.11 + React 19.2.0 | install the packed npm artifact and complete `next build` with a server-rendered page embedding a client component |

The package peer dependency remains `react >=18.0.0`. Passing the matrix above does not imply that every historical or future React/Next.js minor is automatically guaranteed; it records the concrete compatibility evidence maintained by this repository.

## Package-consumer boundary

The Next.js fixture does not import files from `packages/src`. CI builds the library, creates the same tarball shape used for npm publication, installs that tarball into the fixture, and imports only from `next-query-sync`.

This is intended to catch problems such as:

- missing files in the published package;
- broken ESM/CJS/type exports;
- accidental reliance on source-only paths;
- React peer incompatibilities;
- common Next.js App Router server/client build regressions.

## Not yet covered

Browser-level navigation scenarios (hydration interaction, reload, Back, and Forward) are planned separately. The current Next.js gate is a package/SSR/build integration check, not a full end-to-end browser suite.
