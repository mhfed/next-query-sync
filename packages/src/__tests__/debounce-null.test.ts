import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQueryState } from '../useQuery';
import { _resetBatcher } from '../batcher';
import { parseAsString } from '../parsers';

describe('useQueryState — debounced null updates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetBatcher();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    _resetBatcher();
    vi.useRealTimers();
  });

  it('shows null immediately while delaying URL removal for a nullable parser', async () => {
    window.history.replaceState(null, '', '/?q=react');
    const { result } = renderHook(() =>
      useQueryState('q', parseAsString, { debounce: 300 })
    );

    act(() => result.current[1](null));

    expect(result.current[0]).toBeNull();
    expect(new URLSearchParams(window.location.search).get('q')).toBe('react');

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(new URLSearchParams(window.location.search).get('q')).toBeNull();
  });

  it('supports functional updaters that optimistically clear to null', async () => {
    window.history.replaceState(null, '', '/?q=react');
    const { result } = renderHook(() =>
      useQueryState('q', parseAsString, { debounce: 200 })
    );

    act(() => result.current[1](() => null));

    expect(result.current[0]).toBeNull();
    expect(new URLSearchParams(window.location.search).get('q')).toBe('react');

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(new URLSearchParams(window.location.search).get('q')).toBeNull();
  });

  it('keeps primitive defaults optimistic while removing the URL param later', async () => {
    window.history.replaceState(null, '', '/?q=react');
    const { result } = renderHook(() =>
      useQueryState('q', '', { debounce: 300 })
    );

    act(() => result.current[1](''));

    expect(result.current[0]).toBe('');
    expect(new URLSearchParams(window.location.search).get('q')).toBe('react');

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(new URLSearchParams(window.location.search).get('q')).toBeNull();
  });
});
