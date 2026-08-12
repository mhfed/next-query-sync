# Real-world examples

These examples are intentionally small and use only the public `next-query-sync` API. They are written for the Next.js App Router and can be copied into client components.

| Example | URL shape | Why it matters |
|---|---|---|
| [Debounced search](./debounced-search.tsx) | `?q=react` | Keeps typing responsive while replacing the current URL instead of creating one history entry per keystroke. |
| [Product catalog](./product-catalog.tsx) | `?page=2&sort=price&inStock=true` | Combines shareable filters with intentional page history. |
| [URL-backed tabs](./url-tabs.tsx) | `?tab=activity` | Makes the selected view bookmarkable and Back/Forward friendly. |
| [Shareable modal](./shareable-modal.tsx) | `?item=sku-42` | Lets a detail/modal state be opened from a copied link and closed by removing the param. |

## Choosing `push` vs `replace`

Use `history: 'replace'` for high-frequency state where intermediate entries are usually noise, such as search text and live filters.

Use `history: 'push'` when users reasonably expect Back/Forward to traverse the state change, such as pagination, tabs, or opening a shareable detail view.

These are product decisions rather than hard rules; choose the history behavior that matches the navigation semantics of your application.
