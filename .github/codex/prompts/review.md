Review this pull request as a maintainer of next-query-sync.

Read AGENTS.md first and treat its invariants as repository policy.

Focus only on consequential findings that could affect users or maintainability:

1. URL integrity: pathname, unrelated search params, hash fragments, push/replace semantics.
2. Parser correctness and parse/serialize behavior.
3. Type/runtime mismatches, especially ParserWithDefault and nullable setters.
4. React subscription, debounce, concurrency, and unmount behavior.
5. SSR/hydration regressions or accidental browser-global access.
6. Public API or compatibility changes that are not documented.
7. Missing regression tests for changed behavior.

Do not spend review budget on formatting, naming preferences, or checks already enforced deterministically by CI.

For every finding, include:
- severity: P0, P1, or P2;
- affected file/area;
- the concrete failure mode;
- the smallest safe fix or test that would resolve it.

If there are no consequential findings, say that clearly and briefly summarize what you checked.
