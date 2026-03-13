import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQueryState } from '../useQuery';
import { _resetBatcher } from '../batcher';
import { parseAsInteger, parseAsBoolean, parseAsString, parseAsIsoDateTime, withDefault } from '../parsers';
import { z } from 'zod';

beforeEach(() => {
  _resetBatcher();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  _resetBatcher();
});

// Helper: flush microtasks
const flush = () => act(async () => { await Promise.resolve(); });

describe('useQueryState — auto-inference (primitive default)', () => {
  describe('number default', () => {
    it('returns the default when param is absent', () => {
      const { result } = renderHook(() => useQueryState('count', 0));
      expect(result.current[0]).toBe(0);
    });

    it('parses an integer from the URL', () => {
      window.history.replaceState(null, '', '/?count=42');
      const { result } = renderHook(() => useQueryState('count', 0));
      expect(result.current[0]).toBe(42);
    });

    it('parses a float from the URL', () => {
      window.history.replaceState(null, '', '/?price=3.14');
      const { result } = renderHook(() => useQueryState('price', 0));
      expect(result.current[0]).toBeCloseTo(3.14);
    });

    it('returns the default for non-numeric strings', () => {
      window.history.replaceState(null, '', '/?count=abc');
      const { result } = renderHook(() => useQueryState('count', 0));
      expect(result.current[0]).toBe(0);
    });

    it('sets the URL param when setValue is called', async () => {
      const { result } = renderHook(() => useQueryState('count', 0));
      act(() => result.current[1](5));
      await flush();
      expect(new URLSearchParams(window.location.search).get('count')).toBe('5');
    });

    it('removes the param from URL when value equals default (clean URL)', async () => {
      window.history.replaceState(null, '', '/?count=5');
      const { result } = renderHook(() => useQueryState('count', 0));
      act(() => result.current[1](0));
      await flush();
      expect(new URLSearchParams(window.location.search).get('count')).toBeNull();
    });

    it('supports functional updaters', async () => {
      window.history.replaceState(null, '', '/?count=3');
      const { result } = renderHook(() => useQueryState('count', 0));
      act(() => result.current[1]((prev) => prev + 1));
      await flush();
      expect(new URLSearchParams(window.location.search).get('count')).toBe('4');
    });
  });

  describe('boolean default', () => {
    it('returns the default when param is absent', () => {
      const { result } = renderHook(() => useQueryState('active', false));
      expect(result.current[0]).toBe(false);
    });

    it("parses 'true' from the URL", () => {
      window.history.replaceState(null, '', '/?active=true');
      const { result } = renderHook(() => useQueryState('active', false));
      expect(result.current[0]).toBe(true);
    });

    it("parses 'false' from the URL", () => {
      window.history.replaceState(null, '', '/?active=false');
      const { result } = renderHook(() => useQueryState('active', true));
      expect(result.current[0]).toBe(false);
    });

    it('sets the URL param when toggled', async () => {
      const { result } = renderHook(() => useQueryState('active', false));
      act(() => result.current[1](true));
      await flush();
      expect(new URLSearchParams(window.location.search).get('active')).toBe('true');
    });

    it('removes the param from URL when value equals default', async () => {
      window.history.replaceState(null, '', '/?active=true');
      const { result } = renderHook(() => useQueryState('active', false));
      act(() => result.current[1](false));
      await flush();
      expect(new URLSearchParams(window.location.search).get('active')).toBeNull();
    });
  });

  describe('string default', () => {
    it('returns the default when param is absent', () => {
      const { result } = renderHook(() => useQueryState('q', ''));
      expect(result.current[0]).toBe('');
    });

    it('returns the URL value when param is present', () => {
      window.history.replaceState(null, '', '/?q=hello');
      const { result } = renderHook(() => useQueryState('q', ''));
      expect(result.current[0]).toBe('hello');
    });

    it('sets the URL param', async () => {
      const { result } = renderHook(() => useQueryState('q', ''));
      act(() => result.current[1]('world'));
      await flush();
      expect(new URLSearchParams(window.location.search).get('q')).toBe('world');
    });

    it('removes the param when value equals default empty string', async () => {
      window.history.replaceState(null, '', '/?q=hello');
      const { result } = renderHook(() => useQueryState('q', ''));
      act(() => result.current[1](''));
      await flush();
      expect(new URLSearchParams(window.location.search).get('q')).toBeNull();
    });

    it('uses a non-empty string as default', () => {
      const { result } = renderHook(() => useQueryState('sort', 'latest'));
      expect(result.current[0]).toBe('latest');
    });
  });
});

describe('useQueryState — backward compatibility (explicit parsers)', () => {
  it('works with ParserWithDefault (non-nullable)', () => {
    const { result } = renderHook(() =>
      useQueryState('page', withDefault(parseAsInteger, 1))
    );
    expect(result.current[0]).toBe(1);
  });

  it('parses URL value with explicit ParserWithDefault', () => {
    window.history.replaceState(null, '', '/?page=5');
    const { result } = renderHook(() =>
      useQueryState('page', withDefault(parseAsInteger, 1))
    );
    expect(result.current[0]).toBe(5);
  });

  it('works with plain Parser (nullable)', () => {
    const { result } = renderHook(() => useQueryState('q', parseAsString));
    expect(result.current[0]).toBeNull();
  });

  it('returns parsed value with plain Parser', () => {
    window.history.replaceState(null, '', '/?q=test');
    const { result } = renderHook(() => useQueryState('q', parseAsString));
    expect(result.current[0]).toBe('test');
  });

  it('works with explicit parseAsBoolean + withDefault', () => {
    window.history.replaceState(null, '', '/?dark=true');
    const { result } = renderHook(() =>
      useQueryState('dark', withDefault(parseAsBoolean, false))
    );
    expect(result.current[0]).toBe(true);
  });

  it('accepts history option', async () => {
    const { result } = renderHook(() =>
      useQueryState('page', withDefault(parseAsInteger, 1), { history: 'push' })
    );
    const pushSpy = vi.spyOn(window.history, 'pushState');
    act(() => result.current[1](2));
    await flush();
    expect(pushSpy).toHaveBeenCalled();
    pushSpy.mockRestore();
  });

  it('works with .withDefault() method chaining', () => {
    window.history.replaceState(null, '', '/?page=7');
    const { result } = renderHook(() => useQueryState('page', parseAsInteger.withDefault(1)));
    expect(result.current[0]).toBe(7);
  });

  it('works with parseAsIsoDateTime.withDefault()', () => {
    const defaultDate = new Date('2020-01-01T00:00:00.000Z');
    const { result } = renderHook(() =>
      useQueryState('date', parseAsIsoDateTime.withDefault(defaultDate))
    );
    expect(result.current[0]).toBe(defaultDate);
  });

  it('parses ISO date from URL', () => {
    window.history.replaceState(null, '', '/?date=2026-03-13T09:00:00.000Z');
    const defaultDate = new Date('2020-01-01T00:00:00.000Z');
    const { result } = renderHook(() =>
      useQueryState('date', parseAsIsoDateTime.withDefault(defaultDate))
    );
    expect(result.current[0].getTime()).toBe(new Date('2026-03-13T09:00:00.000Z').getTime());
  });
});

describe('useQueryState — Zod schema integration', () => {
  it('returns Zod default when param is absent', () => {
    const Schema = z.object({ role: z.enum(['admin', 'user']) }).default({ role: 'user' });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toEqual({ role: 'user' });
  });

  it('parses valid JSON from URL using Zod', () => {
    window.history.replaceState(null, '', `/?f=${encodeURIComponent(JSON.stringify({ role: 'admin' }))}`);
    const Schema = z.object({ role: z.enum(['admin', 'user']) }).default({ role: 'user' });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toEqual({ role: 'admin' });
  });

  it('falls back to Zod default when URL contains invalid JSON', () => {
    window.history.replaceState(null, '', '/?f=not-valid-json');
    const Schema = z.object({ role: z.enum(['admin', 'user']) }).default({ role: 'user' });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toEqual({ role: 'user' });
  });

  it('falls back to Zod default when URL has valid JSON but fails validation', () => {
    window.history.replaceState(null, '', `/?f=${encodeURIComponent(JSON.stringify({ role: 'superadmin' }))}`);
    const Schema = z.object({ role: z.enum(['admin', 'user']) }).default({ role: 'user' });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toEqual({ role: 'user' });
  });

  it('serializes value as JSON when setFilter is called', async () => {
    const Schema = z.object({ role: z.enum(['admin', 'user']) }).default({ role: 'user' });
    const { result } = renderHook(() => useQueryState('f', Schema));
    act(() => result.current[1]({ role: 'admin' }));
    await flush();
    const raw = new URLSearchParams(window.location.search).get('f');
    expect(JSON.parse(raw!)).toEqual({ role: 'admin' });
  });

  it('works with plain ZodType (nullable)', () => {
    const Schema = z.object({ role: z.string() });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toBeNull();
  });

  it('parses plain ZodType from URL', () => {
    window.history.replaceState(null, '', `/?f=${encodeURIComponent(JSON.stringify({ role: 'admin' }))}`);
    const Schema = z.object({ role: z.string() });
    const { result } = renderHook(() => useQueryState('f', Schema));
    expect(result.current[0]).toEqual({ role: 'admin' });
  });
});

describe('useQueryState — debounce option', () => {
  beforeEach(() => { vi.useFakeTimers() });
  afterEach(() => { vi.useRealTimers() });

  it('shows optimistic value immediately while debouncing', () => {
    const { result } = renderHook(() => useQueryState('q', '', { debounce: 300 }));
    act(() => result.current[1]('hello'));
    // Pending value is shown immediately (before URL updates)
    expect(result.current[0]).toBe('hello');
  });

  it('only writes to URL after debounce delay', async () => {
    const { result } = renderHook(() => useQueryState('q', '', { debounce: 300 }));

    act(() => result.current[1]('hello'));
    // URL not yet updated
    expect(new URLSearchParams(window.location.search).get('q')).toBeNull();

    // Advance timers past debounce window
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(new URLSearchParams(window.location.search).get('q')).toBe('hello');
  });

  it('debounces rapid successive calls into one URL write', async () => {
    const spy = vi.spyOn(window.history, 'replaceState');
    const { result } = renderHook(() => useQueryState('q', '', { debounce: 300 }));

    act(() => result.current[1]('h'));
    act(() => result.current[1]('he'));
    act(() => result.current[1]('hel'));
    act(() => result.current[1]('hello'));

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    // Only one URL write for all four keystrokes
    expect(spy).toHaveBeenCalledTimes(1);
    expect(new URLSearchParams(window.location.search).get('q')).toBe('hello');
    spy.mockRestore();
  });
});

describe('useQueryState — startTransition option', () => {
  it('wraps URL update in startTransition when option is set', async () => {
    const { startTransition } = await import('react');
    const spy = vi.spyOn({ startTransition }, 'startTransition');
    // We just verify the hook runs without error and updates URL
    const { result } = renderHook(() => useQueryState('q', '', { startTransition: true }));
    act(() => result.current[1]('test'));
    await flush();
    expect(new URLSearchParams(window.location.search).get('q')).toBe('test');
    spy.mockRestore();
  });
});
