'use client';

import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'next-query-sync';

const sortParser = parseAsString.withDefault('relevance');
const stockParser = parseAsBoolean.withDefault(false);

export function ProductCatalogControls() {
  // Pagination is intentional navigation, so each page gets a history entry.
  const [page, setPage] = useQueryState('page', 1, { history: 'push' });

  // Live filters replace the current entry so Back is not filled with every toggle.
  const [filters, setFilters] = useQueryStates(
    {
      sort: sortParser,
      inStock: stockParser,
    },
    { history: 'replace' }
  );

  return (
    <section>
      <p>Page {page}</p>

      <label>
        Sort
        <select
          value={filters.sort}
          onChange={(event) => setFilters({ sort: event.target.value })}
        >
          <option value="relevance">Relevance</option>
          <option value="price">Price</option>
          <option value="newest">Newest</option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(event) => setFilters({ inStock: event.target.checked })}
        />
        In stock only
      </label>

      <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}>
        Previous
      </button>
      <button type="button" onClick={() => setPage((current) => current + 1)}>
        Next
      </button>
    </section>
  );
}

// Example URL: ?page=2&sort=price&inStock=true
// Defaults stay typed as string/boolean rather than string|null/boolean|null.
