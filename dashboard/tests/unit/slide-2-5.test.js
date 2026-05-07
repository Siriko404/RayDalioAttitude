import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 2.5 Stress Testing', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 2.5', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-5-stress.js');
    expect(getSlides().find(s => s.id === '2.5')).toBeDefined();
  });

  it('canonical 8.52× asymmetry → AMBER tail band caption', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-5-stress.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedStress: { R_port_pct: { deflationary: -8.125, inflationary: -26, stagflation: -3.05, reflation: 11.825 }, asymmetry_ratio: 8.52, dominant_tail: { regime: 'inflationary' }, tail_band: 'AMBER' } },
      wizard: {}
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/8\.5/);
  });
});
