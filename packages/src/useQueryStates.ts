import { useCallback, useSyncExternalStore } from 'react';
import { subscribe } from './emitter';
import { scheduleUrlUpdate, type HistoryMode } from './batcher';
import type { Parser, ParserWithDefault } from './parsers';

// ---------------------------------------------------------------------------
// Type utilities
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedValue<P extends Parser<any>> = P extends ParserWithDefault<infer T>
  ? T
  : P extends Parser<infer T>
    ? T | null
    : never;

/** Infers the value type of each parser in a schema object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedValues<Schema extends Record<string, Parser<any>>> = {
  [K in keyof Schema]: ParsedValue<Schema[K]>;
};

/** Partial updater object for useQueryStates. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialUpdater<Schema extends Record<string, Parser<any>>> = Partial<{
  [K in keyof Schema]: Schema[K] extends ParserWithDefault<infer T>
    ? T | ((prev: T) => T)
    : Schema[K] extends Parser<infer T>
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
 * // params.page → number
 * // params.search → string | null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQueryStates<Schema extends Record<string, Parser<any>>>(
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

  // Parse current values from the live URL. On the server, parsing `null`
  // preserves ParserWithDefault semantics instead of forcing every value null.
  const values = {} as ParsedValues<Schema>;
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  for (const key of schemaKeys) {
    const parser = schema[key] as Parser<unknown>;
    (values as Record<string, unknown>)[key] = parser.parse(sp?.get(key) ?? null);
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
