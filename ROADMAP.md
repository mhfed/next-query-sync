# next-query-sync roadmap

This roadmap focuses on correctness, maintainability, real-world validation, and a sustainable open-source maintenance process.

## Days 1–7 — correctness and OSS foundation

- [x] Preserve URL hash fragments during query updates.
- [x] Align `useQueryStates` defaulted-parser types with runtime behavior.
- [x] Cancel pending debounced writes on unmount.
- [x] Make nullable debounced clears optimistic while delaying the URL write.
- [x] Add regression tests for the fixes above.
- [x] Add CI for typecheck, tests, build, and package verification.
- [x] Add contribution and security policies.
- [x] Add repository-specific `AGENTS.md` review guidance.
- [x] Add Codex PR-review and release-audit workflow scaffolding.
- [ ] Enable branch protection after the initial CI workflow lands on `main`.

## Days 8–14 — compatibility and integration confidence

- [x] Add compile-time public API tests for hook overloads and parser defaults.
- [x] Define strict integer/float grammar without changing published legacy parser semantics: keep `parseAsInteger` / `parseAsFloat` compatible and add explicit strict alternatives.
- [x] Add deterministic browser history regression coverage for Back/Forward `popstate` restoration.
- [x] Add a minimal Next.js App Router fixture that installs the packed package and validates the server/client build boundary.
- [ ] Extend the Next.js fixture with browser-level hydration, URL update, reload, Back, and Forward coverage if deterministic hook coverage proves insufficient.
- [x] Test React 18/19 targets and document the concrete Next.js compatibility gate.
- [x] Validate the npm tarball from a consumer project rather than importing library source paths.
- [x] Remove generated `packages/dist` artifacts from source control while keeping clean-clone public type verification self-contained.
- [x] Add a production docs build to CI after building the local package dependency.
- [x] Typecheck public examples against generated package declarations.

## Days 15–21 — documentation and real-world examples

- [x] Add focused examples for search, pagination, sorting, tabs, and modal state.
- [x] Rework the docs homepage/playground around behavior verified by tests and CI instead of competitor scorecards or unsupported performance claims.
- [x] Deprecate the ineffective `startTransition` compatibility option without breaking existing callers.
- [x] Add a realistic table/filter example with URL-backed state.
- [x] Document project scope without unsupported competitor claims.
- [ ] Add migration examples for users coming from manual `URLSearchParams` state management.
- [ ] Collect reproducible feedback from real external projects and convert confirmed problems into issues/tests.

## Days 22–26 — maintainer automation

- [ ] Configure `OPENAI_API_KEY` for the guarded Codex workflow only when project API access/credits are available.
- [ ] Evaluate Codex PR reviews against human review outcomes and tune `AGENTS.md`/review prompts once credits are available.
- [ ] Add issue-triage automation only after a clear human-review boundary is defined and project API access exists.
- [ ] Track useful review findings, false positives, and maintenance time saved once Codex review is actually enabled.

## Days 27–30 — release discipline and evidence

- [x] Adopt a repeatable read-only release-candidate process with explicit maintainer approval before publication.
- [x] Allow the Codex release audit to target the exact release candidate ref.
- [x] Add a 1.0.1 → planned 1.1.0 migration guide before changing the published package version.
- [x] Separate consumer dependency audits from maintainer-toolchain audits and add the same thresholds to release-candidate validation.
- [x] Upgrade the test toolchain and remove all high/critical pre-release audit findings; document the one remaining low development-only advisory.
- [x] Move core checkout/setup-node workflows onto their Node 24 action runtime.
- [ ] Produce and inspect a 1.1.0 release candidate artifact.
- [ ] Publish 1.1.0 only after maintainer review of the candidate and final release notes.
- [ ] Run the manual Codex release audit before a future package publication once project API access is configured.
- [x] Maintain `CHANGELOG.md` with user-visible changes and maintenance evidence.
- [ ] Publish maintenance metrics based on real repository activity: releases, issues resolved, external contributors/users, CI health, and useful Codex-assisted maintenance work.
- [ ] Review the next 30-day roadmap from actual user feedback rather than star-count targets.

## Principles

- Prefer real usage and reproducible maintenance evidence over vanity metrics.
- Do not manufacture issues, contributors, stars, downloads, or adoption.
- Keep deterministic CI authoritative for builds, types, tests, examples, package consumers, docs, and release security thresholds.
- Use AI review for repository-specific reasoning only when project API access is available; never make it a prerequisite for ordinary OSS maintenance.
