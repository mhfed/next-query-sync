/**
 * Subscribes to URL change events.
 *
 * Listens to:
 * - `nuqschim_update`: dispatched by the batcher after a programmatic URL change
 * - `popstate`: fired by the browser on back/forward navigation
 *
 * SSR-safe: returns a no-op unsubscribe function on the server.
 *
 * @returns An unsubscribe function — call it to clean up listeners.
 */
export const subscribe = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('nuqschim_update', callback);
  window.addEventListener('popstate', callback);

  return () => {
    window.removeEventListener('nuqschim_update', callback);
    window.removeEventListener('popstate', callback);
  };
};
