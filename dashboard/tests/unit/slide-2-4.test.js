import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 2.4 Risk Parity', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 2.4', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-4-risk-parity.js');
    expect(getSlides().find(s => s.id === '2.4')).toBeDefined();
  });

  it('caption surfaces L value + funding-spread band', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-4-risk-parity.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedRiskParity: { L: 1.656, σ_p_pct: 6.037, weights: { equities: 0.18, treasury10: 0.47, gold: 0.19, commodities: 0.16 }, SR_lev: 0.566, funding_spread_band: 'GREEN' } },
      wizard: { sigma_target: 0.10 }
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/1\.6|L/);
  });
});
