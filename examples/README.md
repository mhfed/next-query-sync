# Real-world examples

These examples are intentionally small and use only the public `next-query-sync` API. They are written for Next.js App Router client components.

| Example | URL shape | Why it matters |
|---|---|---|
| [Debounced search](./debounced-search.tsx) | `?q=react` | Keeps hook state optimistic while replacing the URL after typing settles. |
| [Product catalog](./product-catalog.tsx) | `?page=2&sort=price&inStock=true` | Combines shareable filters with intentional page history. |
| [URL-backed data table](./data-table.tsx) | `?q=usb&sort=price&direction=desc&page=2` | Shows search debounce, typed custom sort parsers, strict pagination, client-side filtering/sorting, and separate push/replace intent. |
| [URL-backed tabs](./url-tabs.tsx) | `?tab=activity` | Makes the selected view bookmarkable and Back/Forward friendly. |
| [Shareable modal](./shareable-modal.tsx) | `?item=sku-42` | Lets detail/modal state open from a copied link and close by removing the param. |

## Choosing `push` vs `replace`

Use `history: 'replace'` for high-frequency state where intermediate entries are usually noise, such as search text and live filters.

Use `history: 'push'` when users reasonably expect Back/Forward to traverse the state change, such as pagination, tabs, or opening a shareable detail view.

These are product decisions rather than hard rules; choose the history behavior that matches the navigation semantics of your application.

## CI contract

Files in this directory are typechecked from a clean package build against the generated public declaration entry point. This keeps copy-paste examples from drifting away from the API users actually install.
