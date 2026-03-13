import { describe, it, expect } from 'vitest';
import {
  makeParser,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsIsoDateTime,
  parseAsArrayOf,
  withDefault,
} from '../parsers';

describe('parseAsString', () => {
  it('returns the string as-is', () => {
    expect(parseAsString.parse('hello')).toBe('hello');
    expect(parseAsString.parse('')).toBe('');
  });
  it('returns null when value is null', () => {
    expect(parseAsString.parse(null)).toBeNull();
  });
  it('serializes correctly', () => {
    expect(parseAsString.serialize('world')).toBe('world');
  });
});

describe('parseAsInteger', () => {
  it('parses valid integers', () => {
    expect(parseAsInteger.parse('42')).toBe(42);
    expect(parseAsInteger.parse('-5')).toBe(-5);
    expect(parseAsInteger.parse('0')).toBe(0);
  });
  it('rounds floats', () => {
    expect(parseAsInteger.serialize(3.7)).toBe('4');
  });
  it('returns null for non-numeric strings', () => {
    expect(parseAsInteger.parse('abc')).toBeNull();
    expect(parseAsInteger.parse('')).toBeNull();
    expect(parseAsInteger.parse(null)).toBeNull();
  });
});

describe('parseAsFloat', () => {
  it('parses floats', () => {
    expect(parseAsFloat.parse('3.14')).toBeCloseTo(3.14);
    expect(parseAsFloat.parse('-0.5')).toBeCloseTo(-0.5);
  });
  it('returns null for invalid values', () => {
    expect(parseAsFloat.parse('xyz')).toBeNull();
    expect(parseAsFloat.parse(null)).toBeNull();
  });
  it('serializes correctly', () => {
    expect(parseAsFloat.serialize(1.5)).toBe('1.5');
  });
});

describe('parseAsBoolean', () => {
  it('parses true/false strings', () => {
    expect(parseAsBoolean.parse('true')).toBe(true);
    expect(parseAsBoolean.parse('false')).toBe(false);
  });
  it('returns null for unknown values', () => {
    expect(parseAsBoolean.parse('yes')).toBeNull();
    expect(parseAsBoolean.parse(null)).toBeNull();
  });
  it('serializes correctly', () => {
    expect(parseAsBoolean.serialize(true)).toBe('true');
    expect(parseAsBoolean.serialize(false)).toBe('false');
  });
});

describe('parseAsArrayOf', () => {
  const parser = parseAsArrayOf(parseAsInteger);

  it('parses comma-separated integers', () => {
    expect(parser.parse('1,2,3')).toEqual([1, 2, 3]);
  });
  it('skips unparseable items', () => {
    expect(parser.parse('1,abc,3')).toEqual([1, 3]);
  });
  it('returns null for empty string', () => {
    expect(parser.parse('')).toBeNull();
    expect(parser.parse(null)).toBeNull();
  });
  it('serializes arrays', () => {
    expect(parser.serialize([1, 2, 3])).toBe('1,2,3');
  });

  it('supports custom separator', () => {
    const pipeParser = parseAsArrayOf(parseAsString, '|');
    expect(pipeParser.parse('a|b|c')).toEqual(['a', 'b', 'c']);
  });
});

describe('withDefault', () => {
  it('returns default when parse returns null', () => {
    const p = withDefault(parseAsInteger, 1);
    expect(p.parse(null)).toBe(1);
    expect(p.parse('')).toBe(1);
    expect(p.parse('abc')).toBe(1);
  });
  it('returns parsed value when valid', () => {
    const p = withDefault(parseAsInteger, 1);
    expect(p.parse('42')).toBe(42);
  });
  it('exposes defaultValue', () => {
    const p = withDefault(parseAsString, 'default');
    expect(p.defaultValue).toBe('default');
  });
});

describe('.withDefault() method chaining', () => {
  it('parseAsInteger.withDefault(0) returns 0 for null', () => {
    const p = parseAsInteger.withDefault(0);
    expect(p.parse(null)).toBe(0);
    expect(p.parse('')).toBe(0);
    expect(p.parse('abc')).toBe(0);
  });

  it('parseAsInteger.withDefault(0) returns parsed value', () => {
    const p = parseAsInteger.withDefault(0);
    expect(p.parse('42')).toBe(42);
  });

  it('parseAsString.withDefault("") returns empty string for null', () => {
    const p = parseAsString.withDefault('');
    expect(p.parse(null)).toBe('');
    expect(p.parse('hello')).toBe('hello');
  });

  it('parseAsBoolean.withDefault(false) returns false for null', () => {
    const p = parseAsBoolean.withDefault(false);
    expect(p.parse(null)).toBe(false);
    expect(p.parse('true')).toBe(true);
  });

  it('exposes defaultValue on chained parser', () => {
    const p = parseAsFloat.withDefault(1.5);
    expect(p.defaultValue).toBe(1.5);
  });

  it('can re-chain to change default', () => {
    const p = parseAsInteger.withDefault(1).withDefault(99);
    expect(p.parse(null)).toBe(99);
    expect(p.defaultValue).toBe(99);
  });

  it('withDefault HOF and .withDefault() produce same result', () => {
    const a = withDefault(parseAsInteger, 5);
    const b = parseAsInteger.withDefault(5);
    expect(a.parse(null)).toBe(b.parse(null));
    expect(a.parse('10')).toBe(b.parse('10'));
    expect(a.defaultValue).toBe(b.defaultValue);
  });
});

describe('makeParser', () => {
  it('creates a custom parser with withDefault method', () => {
    const parseAsCsv = makeParser<string[]>(
      (v) => (v === null ? null : v.split(',')),
      (v) => v.join(',')
    );
    expect(parseAsCsv.parse('a,b')).toEqual(['a', 'b']);
    expect(parseAsCsv.parse(null)).toBeNull();

    const withDef = parseAsCsv.withDefault([]);
    expect(withDef.parse(null)).toEqual([]);
    expect(withDef.defaultValue).toEqual([]);
  });
});

describe('parseAsIsoDateTime', () => {
  const ISO = '2026-03-13T09:00:00.000Z';
  const date = new Date(ISO);

  it('parses a valid ISO string', () => {
    const result = parseAsIsoDateTime.parse(ISO);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(date.getTime());
  });

  it('returns null for null or empty string', () => {
    expect(parseAsIsoDateTime.parse(null)).toBeNull();
    expect(parseAsIsoDateTime.parse('')).toBeNull();
  });

  it('returns null for invalid date strings', () => {
    expect(parseAsIsoDateTime.parse('not-a-date')).toBeNull();
  });

  it('serializes a Date to ISO string', () => {
    expect(parseAsIsoDateTime.serialize(date)).toBe(ISO);
  });

  it('.withDefault() returns default for null', () => {
    const p = parseAsIsoDateTime.withDefault(date);
    expect(p.parse(null)).toBe(date);
    expect(p.parse('')).toBe(date);
    expect(p.parse('bad')).toBe(date);
  });

  it('.withDefault() returns parsed Date for valid input', () => {
    const p = parseAsIsoDateTime.withDefault(date);
    const other = '2025-01-01T00:00:00.000Z';
    expect(p.parse(other)?.getTime()).toBe(new Date(other).getTime());
  });
});
