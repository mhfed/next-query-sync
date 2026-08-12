# Releasing next-query-sync

Releases are intentionally human-approved. Automation verifies and prepares artifacts; it does not publish, tag, or push release changes on its own.

## Release flow

1. **Prepare a release PR**
   - choose the intended semantic version;
   - move relevant entries from `CHANGELOG.md`'s `Unreleased` section into the versioned release section;
   - update `packages/package.json` and the lockfile version together;
   - keep unrelated feature work out of the release PR.

2. **Wait for deterministic CI**
   - Node 20 and 22 quality gates must pass;
   - React 18/19 compatibility must pass;
   - public declaration contracts must pass;
   - the packed-package Next.js integration build must pass.

3. **Create a release candidate artifact**
   - run the `Release candidate` workflow;
   - set `candidate_ref` to the exact release branch, tag candidate, or commit SHA;
   - download the generated `.tgz` artifact and inspect its package contents when needed.

4. **Run the Codex release audit**
   - run `Codex release preparation` against the same `candidate_ref`;
   - Codex reviews user-visible changes, public API/type changes, URL/history/parser/SSR risk, semantic-versioning implications, missing tests/docs, and a draft changelog;
   - if `OPENAI_API_KEY` is not configured, this step safely reports that it was skipped.

5. **Maintainer approval**
   - reconcile the deterministic CI result, release-candidate artifact, changelog, and Codex audit;
   - resolve any consequential findings before publication.

6. **Publish explicitly**
   - npm publication and Git tag/GitHub Release creation remain explicit maintainer actions until a separately reviewed trusted-publishing workflow is adopted;
   - never paste npm or OpenAI secrets into issues, pull requests, logs, or tracked files.

## Release invariants

A release must not be published when:

- deterministic CI is failing;
- the package tarball cannot be consumed by the integration fixture;
- public type changes are undocumented;
- a behavioral change affecting URL/history/parser semantics lacks appropriate tests or release notes;
- the candidate commit differs from the commit that was reviewed.

## Why candidate artifacts are separate from publication

Keeping artifact creation read-only makes release verification safe to run repeatedly. It also creates a concrete object for maintainer review and Codex-assisted release analysis without granting an AI workflow or routine CI job npm publishing credentials.
