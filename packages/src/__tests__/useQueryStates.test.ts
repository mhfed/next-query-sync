import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { _resetBatcher } from '../batcher';
import { parseAsInteger, parseAsString } from '../parsers';
import { useQueryStates } from '../useQueryStates';

const flush = () => act(async () => { await Promise.resolve(); });

beforeEach(() => {
  _resetBatcher();
  window.history.replaceState(null, '', '/');
});

describe('useQueryStates', () => {
  it('returns parser defaults for missing params', () => {
    const { result } = renderHook(() =>
      useQueryStates({
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      })
    );

    expect(result.current[0]).toEqual({ page: 1, q: null });
    expectTypeOf(result.current[0].page).toEqualTypeOf<number>();
    expectTypeOf(result.current[0].q).toEqualTypeOf<string | null>();
  });

  it('parses URL values using each schema parser', () => {
    window.history.replaceState(null, '', '/?page=4&q=hello');

    const { result } = renderHook(() =>
      useQueryStates({
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      })
    );

    expect(result.current[0]).toEqual({ page: 4, q: 'hello' });
  });

  it('batches a multi-value setter into one URL state', async () => {
    const { result } = renderHook(() =>
      useQueryStates({
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      })
    );

    act(() => result.current[1]({ page: 2, q: 'search' }));
    await flush();

    const params = new URLSearchParams(window.location.search);
    expect(params.get('page')).toBe('2');
    expect(params.get('q')).toBe('search');
  });

  it('supports non-null functional updates for defaulted parsers', async () => {
    const { result } = renderHook(() =>
      useQueryStates({ page: parseAsInteger.withDefault(1) })
    );

    act(() => result.current[1]({ page: (page) => page + 1 }));
    await flush();

    expect(new URLSearchParams(window.location.search).get('page')).toBe('2');
  });
});
