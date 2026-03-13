/**
 * Parser interface: converts between string (URL) and typed values.
 * `parse` returns `null` when the value is absent or unparseable.
 * `.withDefault()` creates a ParserWithDefault that never returns null.
 */
export interface Parser<T> {
  parse: (value: string | null) => T | null;
  serialize: (value: T) => string;
  withDefault: (defaultValue: T) => ParserWithDefault<T>;
}

/**
 * A parser with a baked-in default value.
 * `parse` always returns T (never null).
 */
export interface ParserWithDefault<T> extends Parser<T> {
  parse: (value: string | null) => T;
  withDefault: (defaultValue: T) => ParserWithDefault<T>;
  defaultValue: T;
}

// ---------------------------------------------------------------------------
// Internal factory
// ---------------------------------------------------------------------------

/**
 * Creates a Parser<T> from raw parse/serialize functions.
 * Automatically attaches a `.withDefault()` method to every parser.
 */
export function makeParser<T>(
  parseFn: (value: string | null) => T | null,
  serializeFn: (value: T) => string
): Parser<T> {
  const withDefaultFn = (defaultValue: T): ParserWithDefault<T> => ({
    parse: (v: string | null): T => parseFn(v) ?? defaultValue,
    serialize: serializeFn,
    withDefault: withDefaultFn,
    defaultValue,
  });
  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn };
}

// ---------------------------------------------------------------------------
// Built-in parsers
// ---------------------------------------------------------------------------

export const parseAsString = makeParser<string>(
  (v) => v,
  (v) => v
);

export const parseAsInteger = makeParser<number>(
  (v) => {
    if (v === null || v === '') return null;
    const parsed = parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => Math.round(v).toString()
);

export const parseAsFloat = makeParser<number>(
  (v) => {
    if (v === null || v === '') return null;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => v.toString()
);

export const parseAsBoolean = makeParser<boolean>(
  (v) => {
    if (v === null) return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  },
  (v) => v.toString()
);

/** Parses ISO 8601 date strings (e.g. `?date=2026-03-13T09:00:00.000Z`) ↔ `Date`. */
export const parseAsIsoDateTime = makeParser<Date>(
  (v) => {
    if (v === null || v === '') return null;
    const date = new Date(v);
    return Number.isNaN(date.getTime()) ? null : date;
  },
  (v) => v.toISOString()
);

/**
 * Creates a parser for separator-delimited arrays.
 * e.g. `?tags=a,b,c` ↔ `['a', 'b', 'c']`
 */
export function parseAsArrayOf<T>(
  itemParser: Parser<T>,
  separator = ','
): Parser<T[]> {
  return makeParser<T[]>(
    (v) => {
      if (v === null || v === '') return null;
      const items = v.split(separator);
      const result: T[] = [];
      for (const item of items) {
        const parsed = itemParser.parse(item.trim());
        if (parsed !== null) result.push(parsed);
      }
      return result.length > 0 ? result : null;
    },
    (v) => v.map((item) => itemParser.serialize(item)).join(separator)
  );
}

// ---------------------------------------------------------------------------
// withDefault HOF (kept for backward compatibility — delegates to .withDefault())
// ---------------------------------------------------------------------------

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
export function withDefault<T>(
  parser: Parser<T>,
  defaultValue: T
): ParserWithDefault<T> {
  return parser.withDefault(defaultValue);
}

