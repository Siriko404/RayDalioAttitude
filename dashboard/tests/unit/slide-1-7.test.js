import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.7 Inflation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.7', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-7-inflation.js');
    expect(getSlides().find(s => s.id === '1.7')).toBeDefined();
  });

  it('one-point uses regime word (STAGFLATION example)', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-7-inflation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedInflation: { regime: 'STAGFLATION', RealRateBucket: 'MILDLY_NEG', pi_hdln: 8.5, μ: -2 } },
      wizard: {}
    });
    expect(document.querySelector('.one-point').innerHTML.toLowerCase()).toMatch(/stagflation/);
  });
});
