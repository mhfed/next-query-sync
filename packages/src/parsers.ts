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

/**
 * Parses an integer using JavaScript's `parseInt` prefix semantics.
 *
 * This behavior is kept for backward compatibility. For URL contracts that
 * must reject trailing characters, decimals, whitespace, unsafe integers, and
 * non-decimal syntax, use `parseAsStrictInteger` instead.
 */
export const parseAsInteger = makeParser<number>(
  (v) => {
    if (v === null || v === '') return null;
    const parsed = parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => Math.round(v).toString()
);

/**
 * Parses a number using JavaScript's `parseFloat` prefix semantics.
 *
 * This behavior is kept for backward compatibility. For a finite decimal /
 * scientific-notation contract that rejects trailing characters and
 * non-decimal syntax, use `parseAsStrictFloat` instead.
 */
export const parseAsFloat = makeParser<number>(
  (v) => {
    if (v === null || v === '') return null;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => v.toString()
);

const STRICT_INTEGER_PATTERN = /^[+-]?\d+$/;
const STRICT_FLOAT_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Parses a complete base-10 safe integer string.
 *
 * Accepted examples: `0`, `-12`, `+7`, `0012`.
 * Rejected examples: `12px`, `3.14`, `1e3`, `0x10`, surrounding whitespace,
 * and values outside JavaScript's safe-integer range.
 *
 * Serialization throws a RangeError when asked to serialize a value that is
 * not a safe integer so `parse(serialize(value))` cannot silently change it.
 */
export const parseAsStrictInteger = makeParser<number>(
  (v) => {
    if (v === null || v === '' || !STRICT_INTEGER_PATTERN.test(v)) return null;
    const parsed = Number(v);
    return Number.isSafeInteger(parsed) ? parsed : null;
  },
  (v) => {
    if (!Number.isSafeInteger(v)) {
      throw new RangeError('parseAsStrictInteger can only serialize safe integers');
    }
    return v.toString();
  }
);

/**
 * Parses a complete finite decimal or scientific-notation number string.
 *
 * Accepted examples: `0`, `-1.5`, `.5`, `1.`, `1e3`, `-2.5E-2`.
 * Rejected examples: `1.2px`, `Infinity`, `NaN`, `0x10`, and surrounding
 * whitespace.
 *
 * Serialization throws a RangeError for NaN / Infinity so serialized output
 * always remains within this parser's finite-number contract.
 */
export const parseAsStrictFloat = makeParser<number>(
  (v) => {
    if (v === null || v === '' || !STRICT_FLOAT_PATTERN.test(v)) return null;
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  },
  (v) => {
    if (!Number.isFinite(v)) {
      throw new RangeError('parseAsStrictFloat can only serialize finite numbers');
    }
    return v.toString();
  }
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
