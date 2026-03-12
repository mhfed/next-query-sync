import { describe, it, expect } from 'vitest';
import {
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
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
