import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetBatcher } from '../batcher';
import { useQueryState } from '../useQuery';

beforeEach(() => {
  vi.useFakeTimers();
  _resetBatcher();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.useRealTimers();
  _resetBatcher();
});

describe('useQueryState debounce cleanup', () => {
  it('cancels a pending URL write when the hook unmounts', async () => {
    const { result, unmount } = renderHook(() =>
      useQueryState('q', '', { debounce: 300 })
    );

    act(() => result.current[1]('should-not-write'));
    expect(result.current[0]).toBe('should-not-write');

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(new URLSearchParams(window.location.search).get('q')).toBeNull();
  });
});
