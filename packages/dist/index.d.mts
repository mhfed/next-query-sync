/**
 * Parser interface: converts between string (URL) and typed values.
 * `parse` returns `null` when the value is absent or unparseable.
 * `.withDefault()` creates a ParserWithDefault that never returns null.
 */
interface Parser<T> {
    parse: (value: string | null) => T | null;
    serialize: (value: T) => string;
    withDefault: (defaultValue: T) => ParserWithDefault<T>;
}
/**
 * A parser with a baked-in default value.
 * `parse` always returns T (never null).
 */
interface ParserWithDefault<T> extends Parser<T> {
    parse: (value: string | null) => T;
    withDefault: (defaultValue: T) => ParserWithDefault<T>;
    defaultValue: T;
}
/**
 * Creates a Parser<T> from raw parse/serialize functions.
 * Automatically attaches a `.withDefault()` method to every parser.
 */
declare function makeParser<T>(parseFn: (value: string | null) => T | null, serializeFn: (value: T) => string): Parser<T>;
declare const parseAsString: Parser<string>;
declare const parseAsInteger: Parser<number>;
declare const parseAsFloat: Parser<number>;
declare const parseAsBoolean: Parser<boolean>;
/** Parses ISO 8601 date strings (e.g. `?date=2026-03-13T09:00:00.000Z`) ↔ `Date`. */
declare const parseAsIsoDateTime: Parser<Date>;
/**
 * Creates a parser for separator-delimited arrays.
 * e.g. `?tags=a,b,c` ↔ `['a', 'b', 'c']`
 */
declare function parseAsArrayOf<T>(itemParser: Parser<T>, separator?: string): Parser<T[]>;
/**
 * Wraps a parser so that `null` results (missing/unparseable URL values)
 * are replaced with a default value.
 *
 * @example
 * const pageParser = withDefault(parseAsInteger, 1);
 * // Equivalent to: parseAsInteger.withDefault(1)
 * // pageParser.parse(null) → 1
 * // pageParser.parse('5')  → 5
 */
declare function withDefault<T>(parser: Parser<T>, defaultValue: T): ParserWithDefault<T>;

type HistoryMode = 'push' | 'replace';

interface UseQueryStateOptions {
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
type Primitive = string | number | boolean;
/**
 * Widens a primitive literal type to its base type.
 * e.g. `0` → `number`, `false` → `boolean`, `''` → `string`
 * This prevents TypeScript from locking the setter to a narrow literal type.
 */
type WidenPrimitive<T extends Primitive> = T extends number ? number : T extends boolean ? boolean : string;
type Updater<T> = T | null | ((prev: T | null) => T | null);
type UpdaterNoNull<T> = T | ((prev: T) => T);
/** Matches any Zod schema (or any object with a compatible safeParse). */
interface ZodLike<T> {
    safeParse(data: unknown): {
        success: true;
        data: T;
    } | {
        success: false;
        error: unknown;
    };
}
/** Matches a Zod schema that has `.default()` applied (ZodDefault). */
interface ZodDefaultLike<T> extends ZodLike<T> {
    /** Zod v3: defaultValue is a zero-arg function. Zod v4: defaultValue is the raw value. */
    _def: {
        defaultValue: T | (() => T);
    };
}
declare function useQueryState<T extends Primitive>(key: string, defaultValue: T, options?: UseQueryStateOptions): [WidenPrimitive<T>, (updater: UpdaterNoNull<WidenPrimitive<T>>) => void];
declare function useQueryState<T>(key: string, schema: ZodDefaultLike<T>, options?: UseQueryStateOptions): [T, (updater: UpdaterNoNull<T>) => void];
declare function useQueryState<T>(key: string, schema: ZodLike<T>, options?: UseQueryStateOptions): [T | null, (updater: Updater<T>) => void];
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

export { type HistoryMode, type Parser, type ParserWithDefault, type Primitive, type UseQueryStateOptions, type UseQueryStatesOptions, makeParser, parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsInteger, parseAsIsoDateTime, parseAsString, useQueryState, useQueryStates, withDefault };
