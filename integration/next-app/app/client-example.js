'use client';

import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'next-query-sync';

export default function ClientExample() {
  const [page, setPage] = useQueryState('page', 1, { history: 'push' });
  const [filters, setFilters] = useQueryStates({
    q: parseAsString,
    limit: parseAsInteger.withDefault(20),
  });

  return (
    <section>
      <p data-testid="page">Page: {page}</p>
      <p data-testid="query">Query: {filters.q ?? '(none)'}</p>
      <p data-testid="limit">Limit: {filters.limit}</p>
      <button type="button" onClick={() => setPage((current) => current + 1)}>
        Next page
      </button>
      <button type="button" onClick={() => setFilters({ q: 'react', limit: 40 })}>
        Set filters
      </button>
      <button type="button" onClick={() => setFilters({ q: null, limit: 20 })}>
        Reset filters
      </button>
    </section>
  );
}
