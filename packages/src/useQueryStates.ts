import { useCallback, useSyncExternalStore } from 'react';
import { subscribe } from './emitter';
import { scheduleUrlUpdate, type HistoryMode } from './batcher';
import type { Parser } from './parsers';

// ---------------------------------------------------------------------------
// Type utilities
// ---------------------------------------------------------------------------

/** Infers the value type of each parser in a schema object. */
type ParsedValues<Schema extends Record<string, Parser<unknown>>> = {
  [K in keyof Schema]: Schema[K] extends Parser<infer T> ? T | null : never;
};

/** Partial updater object for useQueryStates. */
type PartialUpdater<Schema extends Record<string, Parser<unknown>>> = Partial<{
  [K in keyof Schema]: Schema[K] extends Parser<infer T>
    ? T | null | ((prev: T | null) => T | null)
    : never;
}>;

export interface UseQueryStatesOptions {
  history?: HistoryMode;
}

/**
 * Syncs multiple URL search params with React state using a single hook.
 * All updates in one `setValues` call are batched into a single URL write.
 *
 * @example
 * const [params, setParams] = useQueryStates({
 *   page: withDefault(parseAsInteger, 1),
 *   search: parseAsString,
 * });
 * // params.page → number | null
 * // params.search → string | null
 */
export function useQueryStates<Schema extends Record<string, Parser<unknown>>>(
  schema: Schema,
  options: UseQueryStatesOptions = {}
): [ParsedValues<Schema>, (updater: PartialUpdater<Schema>) => void] {
  const { history = 'replace' } = options;

  // Serialize the schema keys so that the snapshot function reference is stable
  const schemaKeys = Object.keys(schema);

  const getSnapshot = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    const sp = new URLSearchParams(window.location.search);
    return schemaKeys.map((k) => `${k}=${sp.get(k) ?? ''}`).join('&');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaKeys.join(',')]);

  const getServerSnapshot = (): string => '';

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Parse current values from the live URL (safe in client, null on server)
  const values = {} as ParsedValues<Schema>;
  if (typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    for (const key of schemaKeys) {
      const parser = schema[key] as Parser<unknown>;
      (values as Record<string, unknown>)[key] = parser.parse(sp.get(key));
    }
  } else {
    for (const key of schemaKeys) {
      (values as Record<string, unknown>)[key] = null;
    }
  }

  const setValues = useCallback(
    (updater: PartialUpdater<Schema>): void => {
      for (const key of Object.keys(updater) as (keyof Schema)[]) {
        const parser = schema[key] as Parser<unknown>;
        const rawUpdater = updater[key];
        const currentValue = (values as Record<string, unknown>)[key as string];

        const next =
          typeof rawUpdater === 'function'
            ? (rawUpdater as (prev: unknown) => unknown)(currentValue)
            : rawUpdater;

        const serialized = next == null ? null : parser.serialize(next as never);
        scheduleUrlUpdate(key as string, serialized, { history });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, JSON.stringify(values)]
  );

  return [values, setValues];
}
