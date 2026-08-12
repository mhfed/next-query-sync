# next-query-sync roadmap

This roadmap focuses on correctness, maintainability, real-world validation, and a sustainable open-source maintenance process.

## Days 1–7 — correctness and OSS foundation

- [x] Preserve URL hash fragments during query updates.
- [x] Align `useQueryStates` defaulted-parser types with runtime behavior.
- [x] Cancel pending debounced writes on unmount.
- [x] Add regression tests for the fixes above.
- [x] Add CI for typecheck, tests, build, and package verification.
- [x] Add contribution and security policies.
- [x] Add repository-specific `AGENTS.md` review guidance.
- [x] Add Codex PR-review and release-audit workflow scaffolding.
- [ ] Enable branch protection after the initial CI workflow lands on `main`.

## Days 8–14 — compatibility and integration confidence

- [ ] Add type-focused tests for all public hook overloads and parser defaults.
- [ ] Define strict behavior for integer/float parsing edge cases.
- [ ] Add browser history regression coverage for Back/Forward navigation.
- [ ] Add a minimal Next.js integration fixture covering SSR, hydration, URL updates, reload, Back, and Forward.
- [ ] Test supported React/Next.js version ranges and document the compatibility matrix.
- [ ] Review package contents and remove generated artifacts from source control where safe.

## Days 15–21 — documentation and real-world examples

- [ ] Add focused examples for search, pagination, sorting, tabs, and modal state.
- [ ] Add a realistic table/filter example with URL-backed state.
- [ ] Document tradeoffs and intended scope without unsupported competitor claims.
- [ ] Add migration examples for users coming from manual `URLSearchParams` state management.
- [ ] Collect reproducible feedback from real external projects and convert confirmed problems into issues/tests.

## Days 22–26 — maintainer automation

- [ ] Configure `OPENAI_API_KEY` for the guarded Codex workflow when project API access is available.
- [ ] Evaluate Codex PR reviews against human review outcomes and tune `AGENTS.md`/review prompts.
- [ ] Add issue-triage automation only after a clear human-review boundary is defined.
- [ ] Track useful review findings, false positives, and maintenance time saved.

## Days 27–30 — release discipline and evidence

- [ ] Adopt a repeatable release process with explicit maintainer approval.
- [ ] Use the manual Codex release audit before package publication.
- [ ] Maintain `CHANGELOG.md` with user-visible changes and migration notes.
- [ ] Publish maintenance metrics based on real repository activity: releases, issues resolved, external contributors/users, CI health, and useful Codex-assisted maintenance work.
- [ ] Review the next 30-day roadmap from actual user feedback rather than star-count targets.

## Principles

- Prefer real usage and reproducible maintenance evidence over vanity metrics.
- Do not manufacture issues, contributors, stars, downloads, or adoption.
- Keep deterministic CI authoritative for builds, types, and tests.
- Use AI review for repository-specific reasoning, not as a substitute for deterministic checks or maintainer approval.
