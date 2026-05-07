import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.2 Short-Term Cycle', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.2', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-2-short-term-cycle.js');
    expect(getSlides().find(s => s.id === '1.2')).toBeDefined();
  });

  it('caption includes recession probability %', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-2-short-term-cycle.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {}, nyfed: { recession_prob_12m: 0.18 } } }, wizard: {}
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/18/);
  });
});
