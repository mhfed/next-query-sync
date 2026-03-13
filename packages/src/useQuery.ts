import {
  useCallback,
  useSyncExternalStore,
  startTransition as reactStartTransition,
  useState,
  useEffect,
  useRef,
} from 'react';
import { subscribe } from './emitter';
import { scheduleUrlUpdate, type HistoryMode } from './batcher';
import type { Parser, ParserWithDefault } from './parsers';

export interface UseQueryStateOptions {
  /** Whether to push a new history entry or replace the current one. Default: 'replace' */
  history?: HistoryMode;
  /**
   * Debounce URL writes by N milliseconds. While debouncing, the hook returns
   * the pending value immediately (optimistic UI) so inputs stay responsive.
   */
  debounce?: number;
  /**
   * Wrap URL writes in `React.startTransition` so they are treated as
   * non-urgent updates — prevents UI freezes when Next.js fetches new data.
   */
  startTransition?: boolean;
}

/** Primitive types supported by auto-inference. */
export type Primitive = string | number | boolean;

type Updater<T> = T | null | ((prev: T | null) => T | null);
type UpdaterNoNull<T> = T | ((prev: T) => T);

// ---------------------------------------------------------------------------
// Structural interfaces for Zod duck-typing (no hard Zod import)
// ---------------------------------------------------------------------------

/** Matches any Zod schema (or any object with a compatible safeParse). */
interface ZodLike<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: unknown };
}

/** Matches a Zod schema that has `.default()` applied (ZodDefault). */
interface ZodDefaultLike<T> extends ZodLike<T> {
  /** Zod v3: defaultValue is a zero-arg function. Zod v4: defaultValue is the raw value. */
  _def: { defaultValue: T | (() => T) };
}

function isZodDefaultLike<T>(v: unknown): v is ZodDefaultLike<T> {
  return (
    typeof v === 'object' &&
    v !== null &&
    'safeParse' in v &&
    '_def' in v &&
    typeof (v as { _def: Record<string, unknown> })._def === 'object' &&
    'defaultValue' in (v as { _def: Record<string, unknown> })._def
  );
}

function isZodLike<T>(v: unknown): v is ZodLike<T> {
  return typeof v === 'object' && v !== null && 'safeParse' in v;
}

/** Converts a Zod schema to a Parser<T>, using JSON for serialization. */
function zodToParser<T>(schema: ZodLike<T>): Parser<T> {
  const parseFn = (v: string | null): T | null => {
    if (v === null || v === '') return null;
    let raw: unknown;
    try {
      raw = JSON.parse(v);
    } catch {
      return null;
    }
    const result = schema.safeParse(raw);
    return result.success ? result.data : null;
  };
  const serializeFn = (value: T) => JSON.stringify(value);

  const withDefaultFn = (defaultValue: T): ParserWithDefault<T> => ({
    parse: (v) => parseFn(v) ?? defaultValue,
    serialize: serializeFn,
    withDefault: withDefaultFn,
    defaultValue,
  });

  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn };
}

// ---------------------------------------------------------------------------
// Primitive auto-inference
// ---------------------------------------------------------------------------

function inferParser<T extends Primitive>(defaultValue: T): ParserWithDefault<T> {
  let parseFn: (v: string | null) => T;
  let serializeFn: (v: T) => string;

  if (typeof defaultValue === 'number') {
    parseFn = (v) => {
      if (v === null || v === '') return defaultValue;
      const parsed = Number(v);
      return (Number.isNaN(parsed) ? defaultValue : parsed) as T;
    };
    serializeFn = (v) => String(v);
  } else if (typeof defaultValue === 'boolean') {
    parseFn = (v) => {
      if (v === null) return defaultValue;
      return (v === 'true') as unknown as T;
    };
    serializeFn = (v) => String(v);
  } else {
    parseFn = (v) => (v === null ? defaultValue : (v as T));
    serializeFn = (v) => String(v);
  }

  const withDefaultFn = (dv: T): ParserWithDefault<T> => inferParser(dv);

  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn, defaultValue };
}

// ---------------------------------------------------------------------------
// Overloads
// ---------------------------------------------------------------------------

// 1. Primitive default → auto-inferred parser, never null
export function useQueryState<T extends Primitive>(
  key: string,
  defaultValue: T,
  options?: UseQueryStateOptions
): [T, (updater: UpdaterNoNull<T>) => void];

// 2. ZodDefault (schema with .default()) → never null
export function useQueryState<T>(
  key: string,
  schema: ZodDefaultLike<T>,
  options?: UseQueryStateOptions
): [T, (updater: UpdaterNoNull<T>) => void];

// 3. ZodLike (schema without .default()) → nullable
export function useQueryState<T>(
  key: string,
  schema: ZodLike<T>,
  options?: UseQueryStateOptions
): [T | null, (updater: Updater<T>) => void];

// 4. ParserWithDefault → never null
export function useQueryState<T>(
  key: string,
  parser: ParserWithDefault<T>,
  options?: UseQueryStateOptions
): [T, (updater: UpdaterNoNull<T>) => void];

// 5. Plain Parser → nullable
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
 *
 * @example
 * // Auto-inference from primitive default (useState-like)
 * const [count, setCount]   = useQueryState('count', 0);
 * const [search, setSearch] = useQueryState('search', '');
 * const [active, setActive] = useQueryState('active', false);
 *
 * // Method chaining (nuqs-compatible)
 * const [page, setPage]     = useQueryState('page', parseAsInteger.withDefault(1));
 * const [date, setDate]     = useQueryState('date', parseAsIsoDateTime.withDefault(new Date()));
 *
 * // Zod schema (auto JSON parse + validation + safe fallback)
 * const [filter, setFilter] = useQueryState('filter', FilterSchema.default({...}));
 *
 * // Debounce + startTransition (ideal for search inputs)
 * const [q, setQ] = useQueryState('q', '', { debounce: 300, startTransition: true });
 */
export function useQueryState<T>(
  key: string,
  parserOrDefault: Parser<T> | Primitive | ZodLike<T>,
  options: UseQueryStateOptions = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const { history = 'replace', debounce: debounceMs, startTransition: useTransition } = options;

  // ── Resolve parser ────────────────────────────────────────────────────────
  let parser: Parser<T>;
  let primitiveDefault: Primitive | undefined;

  if (typeof parserOrDefault !== 'object') {
    // Case 1: primitive default value
    primitiveDefault = parserOrDefault as Primitive;
    parser = inferParser(primitiveDefault) as unknown as Parser<T>;
  } else if (isZodDefaultLike<T>(parserOrDefault)) {
    // Case 2: Zod schema with .default()
    // Zod v3: defaultValue is a function; Zod v4: defaultValue is the raw value
    const rawDefault = parserOrDefault._def.defaultValue;
    const defaultValue = typeof rawDefault === 'function' ? rawDefault() : rawDefault;
    parser = zodToParser(parserOrDefault).withDefault(defaultValue) as unknown as Parser<T>;
  } else if (isZodLike<T>(parserOrDefault)) {
    // Case 3: Zod schema without .default()
    parser = zodToParser(parserOrDefault);
  } else {
    // Case 4 & 5: explicit Parser / ParserWithDefault
    parser = parserOrDefault as Parser<T>;
  }

  // ── URL subscription ──────────────────────────────────────────────────────
  const getSnapshot = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get(key);
  }, [key]);

  const getServerSnapshot = (): null => null;

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const urlValue = parser.parse(rawValue);

  // ── Debounce: optimistic pending value ────────────────────────────────────
  // When debounce is set, we show the pending value immediately and delay the URL write.
  const [pending, setPending] = useState<{ value: T } | null>(null);

  // Clear pending once the URL has caught up (rawValue changed after debounce fires)
  useEffect(() => {
    if (pending !== null) setPending(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The value consumers see: pending (optimistic) while debouncing, URL value otherwise
  const value = pending !== null ? pending.value : (urlValue as T);

  // ── setValue ──────────────────────────────────────────────────────────────
  const setValue = useCallback(
    (updater: Updater<T>): void => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: T | null) => T | null)(value)
          : updater;

      // Clean URL: remove param when value equals primitive default
      let serialized: string | null;
      if (primitiveDefault !== undefined && next === primitiveDefault) {
        serialized = null;
      } else {
        serialized = next === null ? null : parser.serialize(next);
      }

      const doUpdate = () => {
        if (useTransition) {
          reactStartTransition(() => scheduleUrlUpdate(key, serialized, { history }));
        } else {
          scheduleUrlUpdate(key, serialized, { history });
        }
      };

      if (debounceMs && debounceMs > 0) {
        // Show pending value immediately (optimistic UI)
        if (next !== null) setPending({ value: next });
        // Debounce the actual URL write
        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(doUpdate, debounceMs);
      } else {
        doUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, value, history, debounceMs, useTransition]
  );

  return [value, setValue];
}
