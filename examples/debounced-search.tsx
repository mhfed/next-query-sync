'use client';

import { useQueryState } from 'next-query-sync';

export function DebouncedSearch() {
  const [query, setQuery] = useQueryState('q', '', {
    history: 'replace',
    debounce: 300,
  });

  return (
    <label>
      Search
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
      />
    </label>
  );
}

// Typing "react" produces ?q=react after 300 ms.
// Returning to an empty string removes q because '' is the primitive default.
