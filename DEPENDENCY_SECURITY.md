# Dependency security baseline

This document records the dependency-audit boundary used for release preparation. It complements `SECURITY.md`; it is not a substitute for reviewing advisories in context.

## Release gates

The package CI separates two dependency surfaces:

1. **Consumer surface**
   - Command: `npm audit --omit=dev --audit-level=high`
   - Purpose: catch high-or-critical advisories reachable through the installable non-dev dependency tree.
   - Release expectation: pass.

2. **Maintainer / build / test surface**
   - Command: `npm audit --audit-level=critical`
   - Purpose: prevent critical advisories from being silently accepted in development tooling.
   - Release expectation: pass.

The release-candidate workflow repeats both checks before producing the npm tarball artifact.

## 2026-08-12 pre-1.1 remediation

Before remediation, the locked development tree reported 9 npm audit findings: 2 moderate, 6 high, and 1 critical.

The consumer audit already reported **0 vulnerabilities**, which confirmed the findings were outside the installable non-dev dependency surface.

The test toolchain was then upgraded from Vitest 1.x to Vitest 4.1.10 and the lockfile was refreshed with non-forced audit remediation. Verification after that change passed:

- TypeScript source typecheck
- 138 unit/regression tests across 8 test files
- package build
- generated public declaration contracts
- public TSX example typechecks
- consumer audit at high+ severity
- full-tree audit at critical severity

After remediation, npm audit reported one remaining **low** advisory in the development tree:

- Package: `esbuild` 0.27.3–0.28.0
- Advisory: `GHSA-g7r4-m6w7-qqqr`
- Reported scope: arbitrary file read when running the esbuild development server on Windows

This remaining finding is not present in `npm audit --omit=dev`; it is therefore not part of the package's installable consumer dependency surface. It is kept visible here instead of being hidden or waived implicitly.

## Policy

- Do not use `npm audit fix --force` as routine release maintenance.
- Prefer upgrading direct tooling and regenerating the lockfile under the normal test/build matrix.
- A consumer high/critical finding blocks a release until it is fixed or explicitly assessed and documented.
- A critical finding anywhere in the maintainer tree blocks a release.
- Lower-severity development-only findings may remain only when their dependency path and operational scope are documented and the deterministic release gates stay green.
- Revisit this baseline whenever the lockfile changes materially or before a package release.
