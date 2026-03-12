/**
 * Parser interface: converts between string (URL) and typed values.
 * `parse` returns `null` when the value is absent or unparseable.
 */
export interface Parser<T> {
  parse: (value: string | null) => T | null;
  serialize: (value: T) => string;
}

/**
 * A parser with a baked-in default value.
 * `parse` always returns T (never null).
 */
export interface ParserWithDefault<T> extends Parser<T> {
  parse: (value: string | null) => T;
  defaultValue: T;
}

// ---------------------------------------------------------------------------
// Built-in parsers
// ---------------------------------------------------------------------------

export const parseAsString: Parser<string> = {
  parse: (v) => v,
  serialize: (v) => v,
};

export const parseAsInteger: Parser<number> = {
  parse: (v) => {
    if (v === null || v === '') return null;
    const parsed = parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  serialize: (v) => Math.round(v).toString(),
};

export const parseAsFloat: Parser<number> = {
  parse: (v) => {
    if (v === null || v === '') return null;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  },
  serialize: (v) => v.toString(),
};

export const parseAsBoolean: Parser<boolean> = {
  parse: (v) => {
    if (v === null) return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  },
  serialize: (v) => v.toString(),
};

/**
 * Creates a parser for comma-separated arrays.
 * e.g. `?tags=a,b,c` ↔ `['a', 'b', 'c']`
 */
export function parseAsArrayOf<T>(
  itemParser: Parser<T>,
  separator = ','
): Parser<T[]> {
  return {
    parse: (v) => {
      if (v === null || v === '') return null;
      const items = v.split(separator);
      const result: T[] = [];
      for (const item of items) {
        const parsed = itemParser.parse(item.trim());
        if (parsed !== null) result.push(parsed);
      }
      return result.length > 0 ? result : null;
    },
    serialize: (v) => v.map((item) => itemParser.serialize(item)).join(separator),
  };
}

// ---------------------------------------------------------------------------
// withDefault HOF
// ---------------------------------------------------------------------------

/**
 * Wraps a parser so that `null` results (missing/unparseable URL values)
 * are replaced with a default value.
 *
 * @example
 * const pageParser = withDefault(parseAsInteger, 1);
 * // pageParser.parse(null) → 1
 * // pageParser.parse('5')  → 5
 */
export function withDefault<T>(
  parser: Parser<T>,
  defaultValue: T
): ParserWithDefault<T> {
  return {
    ...parser,
    parse: (v: string | null): T => parser.parse(v) ?? defaultValue,
    defaultValue,
  };
}
