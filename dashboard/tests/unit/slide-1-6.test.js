import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.6 World Order', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.6', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-6-world-order.js');
    expect(getSlides().find(s => s.id === '1.6')).toBeDefined();
  });

  it('caption surfaces CPI USA + CHN values', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-6-world-order.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedWorldOrder: { CPI: { USA: 0.92, CHN: 0.75 }, StageTag: { USA: 'DECLINE', CHN: 'RISE' }, HegemonyRisk: 'ELEVATED' } },
      wizard: {}
    });
    const cap = document.querySelector('.caption').innerHTML;
    expect(cap).toMatch(/0\.9/);
  });
});
