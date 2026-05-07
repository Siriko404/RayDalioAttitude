import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('loadingLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="loader">LOADING</div>';
  });

  it('exports start + stop functions', async () => {
    const mod = await import('../../src/animations/loading-loop.js');
    expect(typeof mod.startLoadingLoop).toBe('function');
    expect(typeof mod.stopLoadingLoop).toBe('function');
  });

  it('start sets data-looping=true; stop clears it', async () => {
    const { startLoadingLoop, stopLoadingLoop } = await import('../../src/animations/loading-loop.js');
    const el = document.getElementById('loader');
    startLoadingLoop(el);
    expect(el.dataset.looping).toBe('true');
    stopLoadingLoop(el);
    expect(el.dataset.looping).toBe('false');
  });
});
