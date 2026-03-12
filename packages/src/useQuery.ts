import { useCallback, useSyncExternalStore } from 'react';
import { subscribe } from './emitter';
import { scheduleUrlUpdate, type HistoryMode } from './batcher';
import type { Parser, ParserWithDefault } from './parsers';

export interface UseQueryStateOptions {
  /** Whether to push a new history entry or replace the current one. Default: 'replace' */
  history?: HistoryMode;
}

type Updater<T> = T | null | ((prev: T | null) => T | null);
type UpdaterNoNull<T> = T | ((prev: T) => T);

// Overload 1: ParserWithDefault → value is never null
export function useQueryState<T>(
  key: string,
  parser: ParserWithDefault<T>,
  options?: UseQueryStateOptions
): [T, (updater: UpdaterNoNull<T>) => void];

// Overload 2: plain Parser → value may be null
export function useQueryState<T>(
  key: string,
  parser: Parser<T>,
  options?: UseQueryStateOptions
): [T | null, (updater: Updater<T>) => void];

/**
 * Syncs a single URL search param with React state.
 *
 * - Uses `useSyncExternalStore` for React 18 Concurrent Mode safety (no tearing).
 * - SSR-safe: returns `null` on the server via `getServerSnapshot`.
 * - Supports functional updaters: `setPage(p => p + 1)`.
 * - When used with `withDefault`, the returned value is narrowed to `T` (never null).
 *
 * @example
 * const [page, setPage] = useQueryState('page', withDefault(parseAsInteger, 1));
 * // page: number  ← TypeScript knows this is never null
 */
export function useQueryState<T>(
  key: string,
  parser: Parser<T>,
  options: UseQueryStateOptions = {}
): [T | null, (updater: Updater<T>) => void] {
  const { history = 'replace' } = options;

  const getSnapshot = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get(key);
  }, [key]);

  const getServerSnapshot = (): null => null;

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = parser.parse(rawValue);

  const setValue = useCallback(
    (updater: Updater<T>): void => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: T | null) => T | null)(value)
          : updater;

      const serialized = next === null ? null : parser.serialize(next);
      scheduleUrlUpdate(key, serialized, { history });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, value, history]
  );

  return [value, setValue];
}
