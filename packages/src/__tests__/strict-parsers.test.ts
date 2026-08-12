import { describe, expect, it } from 'vitest';
import {
  parseAsFloat,
  parseAsInteger,
  parseAsStrictFloat,
  parseAsStrictInteger,
} from '../parsers';

describe('legacy numeric parsers', () => {
  it('keeps parseInt prefix behavior for parseAsInteger', () => {
    expect(parseAsInteger.parse('42px')).toBe(42);
    expect(parseAsInteger.parse('3.14')).toBe(3);
  });

  it('keeps parseFloat prefix behavior for parseAsFloat', () => {
    expect(parseAsFloat.parse('3.14rem')).toBeCloseTo(3.14);
  });
});

describe('parseAsStrictInteger', () => {
  it.each([
    ['0', 0],
    ['-12', -12],
    ['+7', 7],
    ['0012', 12],
    [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER],
    [String(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER],
  ])('parses complete safe-integer input %s', (input, expected) => {
    expect(parseAsStrictInteger.parse(input)).toBe(expected);
  });

  it.each([
    null,
    '',
    '42px',
    '3.14',
    '1e3',
    '0x10',
    ' 12',
    '12 ',
    'Infinity',
    'NaN',
    '9007199254740992',
    '-9007199254740992',
  ])('rejects input %s', (input) => {
    expect(parseAsStrictInteger.parse(input)).toBeNull();
  });

  it('round-trips safe integers', () => {
    for (const value of [0, -1, 42, Number.MAX_SAFE_INTEGER]) {
      expect(parseAsStrictInteger.parse(parseAsStrictInteger.serialize(value))).toBe(value);
    }
  });

  it('throws instead of silently changing invalid serialized values', () => {
    expect(() => parseAsStrictInteger.serialize(1.5)).toThrow(RangeError);
    expect(() => parseAsStrictInteger.serialize(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    expect(() => parseAsStrictInteger.serialize(Infinity)).toThrow(RangeError);
  });

  it('supports a non-null default without weakening strict parsing', () => {
    const parser = parseAsStrictInteger.withDefault(1);
    expect(parser.parse('42')).toBe(42);
    expect(parser.parse('42px')).toBe(1);
    expect(parser.parse(null)).toBe(1);
  });
});

describe('parseAsStrictFloat', () => {
  it.each([
    ['0', 0],
    ['-1.5', -1.5],
    ['+7', 7],
    ['.5', 0.5],
    ['1.', 1],
    ['1e3', 1000],
    ['-2.5E-2', -0.025],
  ])('parses complete finite numeric input %s', (input, expected) => {
    expect(parseAsStrictFloat.parse(input)).toBeCloseTo(expected);
  });

  it.each([
    null,
    '',
    '1.2px',
    '0x10',
    ' 1.2',
    '1.2 ',
    'Infinity',
    '-Infinity',
    'NaN',
    '.',
    '1e',
  ])('rejects input %s', (input) => {
    expect(parseAsStrictFloat.parse(input)).toBeNull();
  });

  it('round-trips representative finite numbers', () => {
    for (const value of [0, -0.5, 3.14, 1e20, 1e-7]) {
      expect(parseAsStrictFloat.parse(parseAsStrictFloat.serialize(value))).toBe(value);
    }
  });

  it('refuses non-finite serialization', () => {
    expect(() => parseAsStrictFloat.serialize(Infinity)).toThrow(RangeError);
    expect(() => parseAsStrictFloat.serialize(-Infinity)).toThrow(RangeError);
    expect(() => parseAsStrictFloat.serialize(NaN)).toThrow(RangeError);
  });

  it('supports withDefault for rejected input', () => {
    const parser = parseAsStrictFloat.withDefault(0);
    expect(parser.parse('1.5')).toBe(1.5);
    expect(parser.parse('1.5rem')).toBe(0);
    expect(parser.parse(null)).toBe(0);
  });
});
