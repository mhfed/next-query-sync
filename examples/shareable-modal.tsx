'use client';

import { parseAsString, useQueryState } from 'next-query-sync';

const products = [
  { id: 'sku-17', name: 'Mechanical keyboard' },
  { id: 'sku-42', name: 'USB-C dock' },
];

export function ShareableProductModal() {
  const [itemId, setItemId] = useQueryState('item', parseAsString, {
    history: 'push',
  });

  const selected = products.find((product) => product.id === itemId) ?? null;

  return (
    <section>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <button type="button" onClick={() => setItemId(product.id)}>
              {product.name}
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div role="dialog" aria-modal="true" aria-labelledby="product-title">
          <h2 id="product-title">{selected.name}</h2>
          <p>Share this URL and the same product detail can be restored.</p>
          <button type="button" onClick={() => setItemId(null)}>
            Close
          </button>
        </div>
      ) : null}
    </section>
  );
}

// Opening the USB-C dock produces ?item=sku-42.
// Closing removes the param. `push` lets the browser Back button close/reopen
// the detail state using the same popstate contract covered by the test suite.
