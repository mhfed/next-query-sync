import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetBatcher } from '../batcher';
import { parseAsInteger, parseAsString } from '../parsers';
import { useQueryState } from '../useQuery';
import { useQueryStates } from '../useQueryStates';

beforeEach(() => {
  _resetBatcher();
  window.history.replaceState(null, '', '/');
});

const restoreUrl = (url: string) => {
  act(() => {
    window.history.replaceState({ restored: true }, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: { restored: true } }));
  });
};

describe('browser navigation / popstate', () => {
  it('re-reads a nullable useQueryState value after navigation', () => {
    window.history.replaceState(null, '', '/?q=first');
    const { result } = renderHook(() => useQueryState('q', parseAsString));

    expect(result.current[0]).toBe('first');

    restoreUrl('/?q=second');

    expect(result.current[0]).toBe('second');
  });

  it('restores a default when navigation removes a defaulted param', () => {
    window.history.replaceState(null, '', '/?page=7');
    const { result } = renderHook(() =>
      useQueryState('page', parseAsInteger.withDefault(1))
    );

    expect(result.current[0]).toBe(7);

    restoreUrl('/');

    expect(result.current[0]).toBe(1);
  });

  it('restores null when navigation removes a plain parser param', () => {
    window.history.replaceState(null, '', '/?q=search');
    const { result } = renderHook(() => useQueryState('q', parseAsString));

    restoreUrl('/');

    expect(result.current[0]).toBeNull();
  });

  it('re-reads all useQueryStates values from the restored URL', () => {
    window.history.replaceState(null, '', '/?page=4&q=before');
    const { result } = renderHook(() =>
      useQueryStates({
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      })
    );

    expect(result.current[0]).toEqual({ page: 4, q: 'before' });

    restoreUrl('/?page=2&q=after');

    expect(result.current[0]).toEqual({ page: 2, q: 'after' });
  });

  it('applies each parser contract when a restored URL omits values', () => {
    window.history.replaceState(null, '', '/?page=3&q=hello');
    const { result } = renderHook(() =>
      useQueryStates({
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      })
    );

    restoreUrl('/');

    expect(result.current[0]).toEqual({ page: 1, q: null });
  });

  it('removes popstate and internal update listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useQueryState('q', parseAsString));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('next-query-sync_update', expect.any(Function));

    removeSpy.mockRestore();
  });
});
