export type HistoryMode = 'push' | 'replace';

interface BatchEntry {
  value: string | null;
  history: HistoryMode;
}

let isScheduled = false;
let batchedParams: URLSearchParams | null = null;
// Track the "most aggressive" history mode in the current batch.
// If ANY update in the batch requests 'push', we use pushState.
let batchedHistory: HistoryMode = 'replace';

/**
 * Schedules a URL search param update.
 * Multiple calls within the same microtask queue are coalesced into a single
 * `history.pushState` / `history.replaceState` call, preventing redundant
 * re-renders and FPS drops.
 *
 * SSR-safe: no-ops on the server.
 */
export const scheduleUrlUpdate = (
  key: string,
  value: string | null,
  options: { history: HistoryMode } = { history: 'replace' }
): void => {
  if (typeof window === 'undefined') return;

  if (!batchedParams) {
    batchedParams = new URLSearchParams(window.location.search);
  }

  if (value === null) {
    batchedParams.delete(key);
  } else {
    batchedParams.set(key, value);
  }

  // 'push' wins over 'replace' within a batch
  if (options.history === 'push') {
    batchedHistory = 'push';
  }

  if (!isScheduled) {
    isScheduled = true;

    queueMicrotask(() => {
      if (!batchedParams) return;

      const search = batchedParams.toString();
      const newUrl = search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname;

      if (batchedHistory === 'push') {
        window.history.pushState(null, '', newUrl);
      } else {
        window.history.replaceState(null, '', newUrl);
      }

      // Reset batch state before dispatching so that any synchronous
      // listeners that call scheduleUrlUpdate start a fresh batch.
      isScheduled = false;
      batchedParams = null;
      batchedHistory = 'replace';

      window.dispatchEvent(new Event('nuqschim_update'));
    });
  }
};

/** Exposed for testing only – resets internal batch state. */
export const _resetBatcher = (): void => {
  isScheduled = false;
  batchedParams = null;
  batchedHistory = 'replace';
};
