/**
 * Parser interface: converts between string (URL) and typed values.
 * `parse` returns `null` when the value is absent or unparseable.
 */
interface Parser<T> {
    parse: (value: string | null) => T | null;
    serialize: (value: T) => string;
}
/**
 * A parser with a baked-in default value.
 * `parse` always returns T (never null).
 */
interface ParserWithDefault<T> extends Parser<T> {
    parse: (value: string | null) => T;
    defaultValue: T;
}
declare const parseAsString: Parser<string>;
declare const parseAsInteger: Parser<number>;
declare const parseAsFloat: Parser<number>;
declare const parseAsBoolean: Parser<boolean>;
/**
 * Creates a parser for comma-separated arrays.
 * e.g. `?tags=a,b,c` ↔ `['a', 'b', 'c']`
 */
declare function parseAsArrayOf<T>(itemParser: Parser<T>, separator?: string): Parser<T[]>;
/**
 * Wraps a parser so that `null` results (missing/unparseable URL values)
 * are replaced with a default value.
 *
 * @example
 * const pageParser = withDefault(parseAsInteger, 1);
 * // pageParser.parse(null) → 1
 * // pageParser.parse('5')  → 5
 */
declare function withDefault<T>(parser: Parser<T>, defaultValue: T): ParserWithDefault<T>;

type HistoryMode = 'push' | 'replace';

interface UseQueryStateOptions {
    /** Whether to push a new history entry or replace the current one. Default: 'replace' */
    history?: HistoryMode;
}
type Updater<T> = T | null | ((prev: T | null) => T | null);
type UpdaterNoNull<T> = T | ((prev: T) => T);
declare function useQueryState<T>(key: string, parser: ParserWithDefault<T>, options?: UseQueryStateOptions): [T, (updater: UpdaterNoNull<T>) => void];
declare function useQueryState<T>(key: string, parser: Parser<T>, options?: UseQueryStateOptions): [T | null, (updater: Updater<T>) => void];

/** Infers the value type of each parser in a schema object. */
type ParsedValues<Schema extends Record<string, Parser<any>>> = {
    [K in keyof Schema]: Schema[K] extends Parser<infer T> ? T | null : never;
};
/** Partial updater object for useQueryStates. */
type PartialUpdater<Schema extends Record<string, Parser<any>>> = Partial<{
    [K in keyof Schema]: Schema[K] extends Parser<infer T> ? T | null | ((prev: T | null) => T | null) : never;
}>;
interface UseQueryStatesOptions {
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
declare function useQueryStates<Schema extends Record<string, Parser<any>>>(schema: Schema, options?: UseQueryStatesOptions): [ParsedValues<Schema>, (updater: PartialUpdater<Schema>) => void];

export { type HistoryMode, type Parser, type ParserWithDefault, type UseQueryStateOptions, type UseQueryStatesOptions, parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryState, useQueryStates, withDefault };
