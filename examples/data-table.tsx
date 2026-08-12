'use client';

import { useMemo } from 'react';
import {
  makeParser,
  parseAsStrictInteger,
  useQueryState,
  useQueryStates,
} from 'next-query-sync';

type SortKey = 'name' | 'price' | 'stock';
type Direction = 'asc' | 'desc';

const sortParser = makeParser<SortKey>(
  (value) =>
    value === 'name' || value === 'price' || value === 'stock'
      ? value
      : null,
  (value) => value
).withDefault('name');

const directionParser = makeParser<Direction>(
  (value) => (value === 'asc' || value === 'desc' ? value : null),
  (value) => value
).withDefault('asc');

const products = [
  { id: 'kbd-01', name: 'Mechanical Keyboard', price: 129, stock: 8 },
  { id: 'mouse-02', name: 'Wireless Mouse', price: 69, stock: 0 },
  { id: 'hub-03', name: 'USB-C Hub', price: 89, stock: 14 },
  { id: 'stand-04', name: 'Laptop Stand', price: 54, stock: 4 },
  { id: 'cam-05', name: '4K Webcam', price: 149, stock: 2 },
  { id: 'mic-06', name: 'USB Microphone', price: 119, stock: 6 },
  { id: 'pad-07', name: 'Desk Mat', price: 32, stock: 21 },
  { id: 'light-08', name: 'Monitor Light', price: 79, stock: 10 },
] as const;

const PAGE_SIZE = 3;

export function UrlBackedDataTable() {
  // Search is high-frequency state: update the input immediately, but replace
  // the URL only after typing settles so history is not filled with keystrokes.
  const [query, setQuery] = useQueryState('q', '', {
    history: 'replace',
    debounce: 250,
  });

  // Sort controls are filters, so they replace the current history entry.
  const [table, setTable] = useQueryStates(
    {
      sort: sortParser,
      direction: directionParser,
    },
    { history: 'replace' }
  );

  // Pagination is intentional navigation, so page changes use push history.
  const [page, setPage] = useQueryState(
    'page',
    parseAsStrictInteger.withDefault(1),
    { history: 'push' }
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) =>
        normalizedQuery === ''
          ? true
          : product.name.toLowerCase().includes(normalizedQuery)
      )
      .toSorted((a, b) => {
        let result: number;
        if (table.sort === 'name') result = a.name.localeCompare(b.name);
        else if (table.sort === 'price') result = a.price - b.price;
        else result = a.stock - b.stock;

        return table.direction === 'asc' ? result : -result;
      });
  }, [query, table.direction, table.sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePage = Math.min(Math.max(1, page), totalPages);
  const rows = filtered.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE
  );

  const changeSort = (nextSort: SortKey) => {
    if (table.sort === nextSort) {
      setTable({
        direction: table.direction === 'asc' ? 'desc' : 'asc',
      });
      return;
    }

    setTable({ sort: nextSort, direction: 'asc' });
  };

  return (
    <section>
      <label>
        Search
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="keyboard, mouse, hub..."
        />
      </label>

      <table>
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => changeSort('name')}>
                Name {table.sort === 'name' ? table.direction : ''}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => changeSort('price')}>
                Price {table.sort === 'price' ? table.direction : ''}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => changeSort('stock')}>
                Stock {table.sort === 'stock' ? table.direction : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <button
          type="button"
          disabled={visiblePage <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {visiblePage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={visiblePage >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </footer>
    </section>
  );
}

// Example URL:
// ?q=usb&sort=price&direction=desc&page=2
//
// History intent:
// - q/sort/direction -> replace
// - page             -> push
//
// The strict page parser rejects malformed values such as ?page=2px and falls
// back to page 1 instead of accepting a numeric prefix.
