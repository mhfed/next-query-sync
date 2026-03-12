import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { scheduleUrlUpdate, _resetBatcher } from '../batcher';

// jsdom provides window.location, but replaceState/pushState need manual setup
beforeEach(() => {
  _resetBatcher();
  // Reset URL
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  _resetBatcher();
});

describe('scheduleUrlUpdate', () => {
  it('updates a single param via replaceState', async () => {
    const spy = vi.spyOn(window.history, 'replaceState');
    scheduleUrlUpdate('page', '2');

    // queueMicrotask runs after current microtask checkpoint
    await Promise.resolve();

    expect(spy).toHaveBeenCalledOnce();
    expect(window.location.search).toBe('?page=2');
    spy.mockRestore();
  });

  it('batches multiple updates into a single URL write', async () => {
    const spy = vi.spyOn(window.history, 'replaceState');

    scheduleUrlUpdate('page', '3');
    scheduleUrlUpdate('search', 'hello');

    await Promise.resolve();

    expect(spy).toHaveBeenCalledOnce();
    const sp = new URLSearchParams(window.location.search);
    expect(sp.get('page')).toBe('3');
    expect(sp.get('search')).toBe('hello');
    spy.mockRestore();
  });

  it("uses pushState when any update in the batch has history: 'push'", async () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    scheduleUrlUpdate('page', '1', { history: 'replace' });
    scheduleUrlUpdate('search', 'q', { history: 'push' });

    await Promise.resolve();

    expect(pushSpy).toHaveBeenCalledOnce();
    expect(replaceSpy).not.toHaveBeenCalled();
    pushSpy.mockRestore();
    replaceSpy.mockRestore();
  });

  it('removes a param when value is null', async () => {
    window.history.replaceState(null, '', '/?page=5&search=foo');
    _resetBatcher();

    scheduleUrlUpdate('page', null);

    await Promise.resolve();

    const sp = new URLSearchParams(window.location.search);
    expect(sp.get('page')).toBeNull();
    expect(sp.get('search')).toBe('foo');
  });

  it('dispatches nuqschim_update event after flush', async () => {
    const listener = vi.fn();
    window.addEventListener('nuqschim_update', listener);

    scheduleUrlUpdate('x', '1');
    await Promise.resolve();

    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('nuqschim_update', listener);
  });

  it('omits the ? when all params are cleared', async () => {
    window.history.replaceState(null, '', '/?page=1');
    _resetBatcher();

    scheduleUrlUpdate('page', null);
    await Promise.resolve();

    expect(window.location.href).not.toContain('?');
  });
});
