Prepare a maintainer-facing release audit for next-query-sync.

Read AGENTS.md first. Inspect the changes since the latest Git tag or, if tags are unavailable, the recent changes on the current branch.

Produce a concise report with:

1. User-visible changes grouped as fixes, features, documentation, and maintenance.
2. Any public API or TypeScript type changes.
3. Any URL/history/parser/SSR behavior changes.
4. Breaking-change risk and whether a major/minor/patch release is appropriate under semantic versioning.
5. Tests or documentation that appear missing for the release.
6. A draft changelog entry written for package users.

Do not publish, tag, push, edit package versions, or modify files. Release publication always requires explicit maintainer approval after deterministic CI passes.
